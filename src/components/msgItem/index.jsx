import { getSolidDataset } from "@inrupt/solid-client";
import { React, Component } from "react";
import { Link } from 'react-router-dom';
import { deleteMessage, moveMessageToDir, toggleRead, formatSingleFrom } from "../../util/message";

function formatFrom(from) {
    try {
        if (from != undefined) {
            if (typeof from == "string") {
                from = JSON.parse(from);
            }
            return from.map(x => {
                return formatSingleFrom(x)
            }).join(", ");
        }
        return "";
    } catch (error) {
        return "";
    }
}

function formatTimestamp(timestamp) {
    const dt = new Date(timestamp);
    if (dt.toLocaleDateString() == (new Date()).toLocaleDateString()) {
        return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            move_dir: props.move_dir,
            onDirChange: props.onDirChange,
            onReadToggle: props.onReadToggle,
            data: props.message_data
        }

        this.id_prefix = props.id_prefix || "message"
        this.showRecipients = props.showRecipients || false;
    }

    get_move_dir_icon = () => {
        if (this.state.move_dir.endsWith("inbox.json")) {
            return "📥";
        } else if (this.state.move_dir.endsWith("archive.json")) {
            return "🗄️";
        } else {
            return "📤";
        }
    }

    render() {
        console.log("data", this.state.data, this.state.data.from);
        return <Link to={`/${this.id_prefix}/${this.state.url}`}>
            <div className={"msg-item-row" + (!this.state.data.is_read ? " unread" : "")}>
                <div className="read-indicator">
                    <button key={this.state.data.is_read} onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleRead(this.state.url, this.state.session);
                        this.state.onReadToggle();
                    }}>{this.state.data.is_read ? "⚪" : "🔵"}</button>
                </div>
                <div className="from">{this.showRecipients ? this.state.data.to || <em>No Recipients</em> : formatFrom(this.state.data.from)}</div>
                <div className="subject">{this.state.data.subject || <em>No Subject</em>}</div>
                <div className="timestamp">{formatTimestamp(this.state.data.timestamp)}</div>
                <div className="actions">
                    {(this.state.move_dir != false) &&
                        <button onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            moveMessageToDir(this.state.url, this.state.move_dir, this.state.session);
                            this.state.onDirChange();
                        }}>{this.get_move_dir_icon()}</button>}
                    <button onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deleteMessage(this.state.url, this.state.session);
                        this.state.onDirChange();
                    }}>🗑️</button>
                </div>
            </div></Link>;
    }
}

export default MessageItem;
