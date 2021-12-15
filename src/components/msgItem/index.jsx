import {
    getSolidDataset, getThing, getStringNoLocale, getThingAll, getDatetime, getSourceUrl, getInteger
} from "@inrupt/solid-client";
import { DatasetContext, SessionProvider, Table, TableColumn, ThingProvider, useThing, useSession, useDataset } from "@inrupt/solid-ui-react";
import { React, useContext, Component } from "react";
import MsgThing from "../MsgThing";
import { SMAIL } from "../../SMAIL";
import { Link } from 'react-router-dom';
import { deleteMessage } from "../../util/message";

function getSubject(url, fs) {
    getSolidDataset(url, fs).then(m => console.log("m", m));
    return true;
}

function formatFrom(from) {
    if (from != undefined) {
        from = JSON.parse(from)
        return from.map(x => {
            return formatSingleFrom(x)
        }).join(", ")
    }
    return ""
}

function formatSingleFrom(from) {
    const addr = from['address'];
    const name = from['name'];
    if (name) {
        return `${name} (${addr})`;
    }
    return addr;
}

function formatTimestamp(timestamp) {
    const dt = new Date(timestamp);
    if (dt.toLocaleDateString() == (new Date()).toLocaleDateString()) {
        return dt.toLocaleTimeString();
    } else {
        return dt.toLocaleDateString();
    }
}

class MessageItem extends Component {

    constructor(props) {
        super(props);

        this.state = {
            session: props.session,
            url: props.url,
            data: {}
        }

        // openMessage = () => {
        //     return <Redirect to={`/message/${this.state.url}`} />;
        // }

        getSolidDataset(this.state.url, { fetch: this.state.session.fetch }).then(dataset => {
            const message_thing = getThingAll(dataset, this.state.url, { fetch: this.state.session.fetch })[0];
            this.setState({
                data: {
                    subject: getStringNoLocale(message_thing, SMAIL.subject),
                    from: getStringNoLocale(message_thing, SMAIL.from),
                    timestamp: getInteger(message_thing, SMAIL.timestamp)
                }
            });
        });

    }

    render() {
        return <Link to={`/message/${this.state.url}`}><div className="msg-item-row">
            <div className="from">{formatFrom(this.state.data.from)}</div>
            <div className="subject">{this.state.data.subject}</div>
            <div className="timestamp">{formatTimestamp(this.state.data.timestamp)}</div>
            <div className="actions"><button onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteMessage(this.state.url, this.state.session);
            }}>🗑️</button><button>🗄️</button><button>🔵</button></div>
        </div></Link>;
    }
}

export default MessageItem;
