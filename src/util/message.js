import { deleteSolidDataset } from "@inrupt/solid-client";
import MsgThing from "../components/MsgThing";

export function deleteMessage(messageUrl, session) {
    deleteSolidDataset(messageUrl, { fetch: session.fetch }).then(() => console.log("deleted " + messageUrl));
}