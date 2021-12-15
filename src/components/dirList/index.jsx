import {
    getSolidDataset, getThing, getStringNoLocale, getThingAll, getDatetime, getSourceUrl, getInteger
} from "@inrupt/solid-client";
import { DatasetContext, SessionProvider, Table, TableColumn, ThingProvider, useThing, useSession, useDataset } from "@inrupt/solid-ui-react";
import { useContext, Component } from "react";
import { SMAIL } from "../../SMAIL";
import MessageItem from "../msgItem";

function getSubject(url, fs) {
    getSolidDataset(url, fs).then(m => console.log("m", m));
    return true;
}

function getMessageUrls(dir_url, session) {
    return getSolidDataset(dir_url, { fetch: session.fetch }).then(d => Object.keys(d['graphs']['default']).slice(1));
}

async function getMessageTimestamp(msg_url, session) {
    const dataset = await getSolidDataset(msg_url, { fetch: session.fetch });
    const message_thing = getThingAll(dataset, msg_url, { fetch: session.fetch })[0];
    return getInteger(message_thing, SMAIL.timestamp);
}

class DirListComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            session: props.session,
            dir_url: props.dir_url,
            messageUrls: []
        }

        this.update_listings()
    }

    update_listings = () => {
        getMessageUrls(this.state['dir_url'], this.state['session']).then(urls => {
            const url_timestamps = urls.map(url => {
                return getMessageTimestamp(url, this.state.session)
                    .then(timestamp => {
                        return {
                            url: url,
                            timestamp: timestamp
                        };
                    })
            });

            Promise.all(url_timestamps).then(values => {
                const sorted_urls = values.sort((a, b) => b['timestamp'] - a['timestamp']).map(value => value['url']);
                this.setState({
                    messageUrls: []
                });
                this.setState({
                    messageUrls: sorted_urls
                });
            });

        });
    }

    render() {
        return <div className="dir-view">
            <div className="message-table">
                <div className="msg-item-row header">
                    <div className="from">From</div>
                    <div className="subject">Subject</div>
                    <div className="timestamp">Recieved</div>
                    <div className="actions"></div>
                </div>
                {
                    this.state.messageUrls.map(url =>
                        <MessageItem url={url} session={this.state.session} />
                    )
                }
            </div>
            <div className="status-bar">
                <div className="msg-count">{this.state.messageUrls.length} Message{this.state.messageUrls.length != 1 ? "s" : ""}</div>
                <button onClick={this.update_listings}>Refresh</button>
            </div>
        </div>
    }
}

export default DirListComponent;
