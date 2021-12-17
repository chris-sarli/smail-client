import { deleteSolidDataset, getSolidDataset, getThingAll, getStringNoLocale, getFile, overwriteFile, setStringNoLocale, getBoolean, getInteger, setThing, saveSolidDatasetAt, setBoolean } from "@inrupt/solid-client";
import { SMAIL } from "../SMAIL";

export async function removeMessageFromDir(message, dir, session) {
    const blob = await getFile(dir, session);
    blob.text().then(async (text) => {
        const contents = JSON.parse(text)['contents'];
        if (message in contents) {
            delete contents[message];
            return overwriteFile(
                dir,
                Buffer.from(JSON.stringify({ contents: contents })),
                { contentType: "application/json", fetch: session['fetch'] });
        }
    });
}

export async function addMessageToDirIndex(message, message_thing, dir, session) {
    getFile(dir, session).then(blob => {
        blob.text().then(async (text) => {
            const contents = JSON.parse(text)['contents']
            if (!(message in contents)) {
                contents[message] = {
                    timestamp: getInteger(message_thing, SMAIL.timestamp),
                    is_read: getBoolean(message_thing, SMAIL.is_read),
                    subject: getStringNoLocale(message_thing, SMAIL.subject),
                    from: getStringNoLocale(message_thing, SMAIL.from),
                    to: getStringNoLocale(message_thing, SMAIL.to),
                }
                return overwriteFile(
                    dir,
                    Buffer.from(JSON.stringify({ contents: contents })),
                    { contentType: "application/json", fetch: session['fetch'] })
            }
        })
    })
}

export async function moveMessageToDir(message, dir, session) {
    let message_dataset = await getSolidDataset(message, session);
    let message_thing = getThingAll(message_dataset, message, session)[0];
    const current_dir = getStringNoLocale(message_thing, SMAIL.directory);
    message_thing = setStringNoLocale(message_thing, SMAIL.directory, dir);

    message_dataset = setThing(message_dataset, message_thing);

    return Promise.all(
        [saveSolidDatasetAt(message, message_dataset, session),
        removeMessageFromDir(message, current_dir, session),
        addMessageToDirIndex(message, message_thing, dir, session)]);
}

export async function getMessageThing(messageUrl, session) {
    const dataset = await getSolidDataset(messageUrl, session);
    return getThingAll(dataset, messageUrl, session)[0];
}

export async function updateDirIndex(dir, message, updates, session) {
    getFile(dir, session).then(blob => {
        blob.text().then(async (text) => {
            const contents = JSON.parse(text)['contents']
            if (message in contents) {
                const message_data = contents[message];
                Object.keys(updates).forEach(key => {
                    message_data[key] = updates[key];
                });
                contents[message] = message_data;
            }
            return overwriteFile(
                dir,
                Buffer.from(JSON.stringify({ contents: contents })),
                { contentType: "application/json", fetch: session['fetch'] })
        })
    })
}

export async function deleteMessage(messageUrl, session) {
    const message_thing = await getMessageThing(messageUrl, session);
    const current_dir = getStringNoLocale(message_thing, SMAIL.directory);
    return await Promise.all([
        deleteSolidDataset(messageUrl, { fetch: session.fetch }).then(() => console.log("deleted " + messageUrl)), removeMessageFromDir(messageUrl, current_dir, session)
    ]);
}

export async function toggleRead(message, session) {
    let message_dataset = await getSolidDataset(message, session);
    let message_thing = getThingAll(message_dataset, message, session)[0];
    const current_is_read = getBoolean(message_thing, SMAIL.is_read);
    const dir = getStringNoLocale(message_thing, SMAIL.directory);

    message_thing = setBoolean(message_thing, SMAIL.is_read, !current_is_read);
    message_dataset = setThing(message_dataset, message_thing);


    return await Promise.all([
        saveSolidDatasetAt(message, message_dataset, session),
        getFile(dir, session)
            .then(blob => blob.text())
            .then(text => {
                const contents = JSON.parse(text)['contents']
                if (message in contents) {
                    contents[message]['is_read'] = !current_is_read;
                    return overwriteFile(
                        dir,
                        Buffer.from(JSON.stringify({ contents: contents })),
                        { contentType: "application/json", fetch: session['fetch'] })
                }
            })
    ]);
}

export function formatSingleFrom(from) {
    const addr = from['address'];
    const name = from['name'];
    if (name) {
        return `${name} (${addr})`;
    }
    return addr;
}