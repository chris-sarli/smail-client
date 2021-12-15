import {
    getSolidDataset, getThing, getStringNoLocale, getThingAll, getDatetime, getSourceUrl, getInteger, createSolidDataset, addStringNoLocale, addUrl, createThing, setThing, saveSolidDatasetAt
} from "@inrupt/solid-client";
import { DatasetContext, SessionProvider, Table, TableColumn, ThingProvider, useThing, useSession, useDataset } from "@inrupt/solid-ui-react";
import { useContext, Component } from "react";
import MsgThing from "../MsgThing";
import { SMAIL } from "../../SMAIL";
import { Navigate } from 'react-router-dom';
const { RDF } = require("@inrupt/vocab-common-rdf");

class Composer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            session: props.session,
            outboxIri: props.outboxIri,
            subject: "",
            to: "",
            body: "",
            redirect: ""
        }
    }

    render() {
        const handleSubject = (e) => {
            this.setState({
                subject: document.getElementById("subject_field").value
            })
        }

        const handleTo = (e) => {
            this.setState({
                to: document.getElementById("to_field").value
            })
        }

        const handleBody = (e) => {
            this.setState({
                body: document.getElementById("body_field").value
            })
        }

        const sendMessage = async () => {
            let newMsgUrl = this.state.outboxIri + "1";
            let newMessageDataset = createSolidDataset();
            let newMessage = createThing({ name: "1" });

            newMessage = addStringNoLocale(newMessage, SMAIL.to, this.state.to);
            newMessage = addStringNoLocale(newMessage, SMAIL.body, this.state.body);
            newMessage = addStringNoLocale(newMessage, SMAIL.subject, this.state.subject);
            newMessage = addUrl(newMessage, RDF.type, SMAIL.Message);
            newMessageDataset = setThing(newMessageDataset, newMessage);
            await saveSolidDatasetAt(newMsgUrl, newMessageDataset, { fetch: this.state.session.fetch }).catch(e => console.error(e));
            this.setState({
                redirect: <Navigate to="/" />
            });
        }

        return <div className="messageView">
            <div className="header">
                <h2>Subject: <input id="subject_field" type="text" onChange={handleSubject}></input></h2>
                <p><em>You</em> → <input id="to_field" type="text" onChange={handleTo} /></p>
            </div>
            <div className="body">
                <textarea id="body_field" type="text" onChange={handleBody}></textarea>
            </div>

            <button onClick={sendMessage}>Send</button>
            {this.state.redirect}
        </div>;
    }
}

export default Composer;
