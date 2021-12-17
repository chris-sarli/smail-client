import { getFile } from "@inrupt/solid-client";
import { Component } from "react";
import MessageItem from "../msgItem";
class DirListComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            session: props.session,
            dirs_url: props.dirs_url,
            dir: props.dir,
            dir_url: props.dirs_url + props.dir + ".json",
            messages: []
        }

        this.editOnClick = props.editOnClick || false;
        this.showRecipients = props.showRecipients || false;

        this.update_listings();
    }

    update_listings = () => {
        getFile(this.state['dir_url'], this.state['session']).then(blob => {
            blob.text().then(text => {
                this.setState({ messages: Object.entries(JSON.parse(text)["contents"]).sort((a, b) => b[1]['timestamp'] - a[1]['timestamp']) });
            })
        })
    }

    get_move_dir = () => {
        switch (this.state.dir) {
            case "inbox":
                return this.state.dirs_url + "archive.json";
            case "archive":
                return this.state.dirs_url + "inbox.json";
            case "drafts":
                return this.state.dirs_url + "outbox.json";
            case "sent":
                return false;
            default:
                break;
        }
    }

    remove_message_from_list = (message) => {
        return () => {
            this.setState({
                messages: this.state.messages.filter((pair) => (pair[0] != message))
            })
        }
    }

    toggle_read = (message) => {
        return () => {
            this.setState({
                messages: this.state.messages.map((pair) => {
                    if (pair[0] == message) {
                        const current = pair[1];
                        current['is_read'] = !current['is_read'];
                        return [pair[0], current];
                    }
                    return pair;
                })
            })
        }
    }

    render() {
        return <div className="dir-view">
            <div className="message-table">
                <div className="msg-item-row header">
                    <div className="read-indicator"></div>
                    <div className="from">{this.showRecipients ? "To" : "From"}</div>
                    <div className="subject">Subject</div>
                    <div className="timestamp">{this.showRecipients ? "Last Edit" : "Recieved"}</div>
                    <div className="actions"></div>
                </div>
                {
                    this.state.messages.map((pair) => <MessageItem url={pair[0]} move_dir={this.get_move_dir()} onDirChange={this.remove_message_from_list(pair[0])} onReadToggle={this.toggle_read(pair[0])} message_data={pair[1]} session={this.state.session} id_prefix={this.editOnClick ? "edit" : "message"} showRecipients={this.showRecipients} />)
                }
            </div>
            <div className="status-bar">
                <div className="msg-count">{this.state.messages.length} Message{this.state.messages.length != 1 ? "s" : ""}</div>
                <button onClick={this.update_listings}>Refresh</button>
            </div>
        </div>
    }
}

export default DirListComponent;
