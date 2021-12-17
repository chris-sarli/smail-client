import {
    getSolidDataset, getStringNoLocale, getThingAll, getInteger, setThing, saveSolidDatasetAt, setInteger, setStringNoLocale
} from "@inrupt/solid-client";
import { Component } from "react";
import { SMAIL } from "../../SMAIL";
import { moveMessageToDir, updateDirIndex } from "../../util/message";

class Editor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            session: props.session,
            url: window.location.pathname.slice("/edit/".length),
            message: {},
            redirect: ''
        }

        getSolidDataset(this.state.url, { fetch: this.state.session.fetch }).then(dataset => {
            const message_thing = getThingAll(dataset, this.state.url, { fetch: this.state.session.fetch })[0];
            this.setState({
                message: {
                    subject: getStringNoLocale(message_thing, SMAIL.subject),
                    from: getStringNoLocale(message_thing, SMAIL.from),
                    to: getStringNoLocale(message_thing, SMAIL.to),
                    timestamp: getInteger(message_thing, SMAIL.timestamp),
                    body: getStringNoLocale(message_thing, SMAIL.body),
                    messageId: getStringNoLocale(message_thing, SMAIL.messageId)
                }
            });
        });
    }

    render() {
        const handleUpdate = (field) => {
            const message = this.state.message;
            message[field] = document.getElementById(field + "_field").value;
            this.setState({
                message: message
            })
        }

        const handleSubject = () => {
            handleUpdate("subject");
        }

        const handleTo = () => {
            handleUpdate("to");
        }

        const handleBody = () => {
            handleUpdate("body");
        }

        const saveMessage = async () => {
            let message_dataset = await getSolidDataset(this.state.url, this.state.session);
            let message_thing = getThingAll(message_dataset, this.state.url, this.state.session)[0];

            const timestamp = (new Date()).getTime();

            message_thing = setStringNoLocale(message_thing, SMAIL.to, this.state.message['to']);
            message_thing = setStringNoLocale(message_thing, SMAIL.subject, this.state.message['subject']);
            message_thing = setStringNoLocale(message_thing, SMAIL.body, this.state.message['body']);
            message_thing = setInteger(message_thing, SMAIL.timestamp, timestamp);

            message_dataset = setThing(message_dataset, message_thing);

            await saveSolidDatasetAt(this.state.url, message_dataset, { fetch: this.state.session.fetch });
            await updateDirIndex("https://chris-sarli.inrupt.net/smail/chris.sarl/test/dir/drafts.json", this.state.url,
                {
                    'to': this.state.message['to'],
                    'subject': this.state.message['subject'],
                    'body': this.state.message['body'],
                    'timestamp': this.state.message['timestamp']
                }, this.state.session);
        }

        const sendMessage = async () => {
            await saveMessage();
            await moveMessageToDir(this.state.url, "https://chris-sarli.inrupt.net/smail/chris.sarl/test/dir/outbox.json", this.state.session);
        }

        return <div className="messageView">
            <div className="header">
                <h2>Subject: <input id="subject_field" type="text" onChange={handleSubject} value={this.state.message['subject']}></input></h2>
                <p><em>You</em> → <input id="to_field" type="text" onChange={handleTo} value={this.state.message['to']} /></p>
            </div>
            <div className="body">
                <textarea id="body_field" type="text" onChange={handleBody} value={this.state.message['body']}></textarea>
            </div>

            <button onClick={saveMessage}>Save</button>
            <button onClick={sendMessage}>Send</button>
            {this.state.redirect}
        </div>;
    }
}

export default Editor;
