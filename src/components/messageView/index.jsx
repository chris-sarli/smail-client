import {
    getSolidDataset, getStringNoLocale, getThingAll, getInteger
} from "@inrupt/solid-client";
import { Component } from "react";
import { SMAIL } from "../../SMAIL";
import { formatSingleFrom } from "../../util/message";

function formatAddresses(from) {
    try {
        if (from != undefined) {
            from = JSON.parse(from)
            return from.map(x => {
                return formatSingleFrom(x)
            }).join(", ")
        }
        return ""
    } catch (error) {
        return from;
    }
}


function formatTimestamp(timestamp) {
    const dt = new Date(timestamp);
    return dt.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
}

class MessageView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            session: props.session,
            url: window.location.pathname.slice("/message/".length),
            message: {}
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
        return <div className="messageView">
            <div className="header">
                <h2>{this.state.message.subject}</h2>
                <p>{formatTimestamp(this.state.message.timestamp)}</p>
                <p>{formatAddresses(this.state.message.from)} → {formatAddresses(this.state.message.to)}</p>
                <details>
                    <summary>Message Details</summary>
                    <p>Message ID: {this.state.message.messageId}</p>
                    <p>Message URL: <a href={this.state.url} target="_blank">{this.state.url}</a></p>
                </details>
            </div>
            <div className="body">
                <p>
                    {(this.state.message.body || "").replaceAll("\n", "\n").split("\n").map(line => <span>{line}<br /></span>)}</p>
            </div>
        </div>;
    }
}

export default MessageView;
