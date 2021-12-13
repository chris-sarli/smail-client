import {
    getSolidDataset, getThing, getStringNoLocale, getThingAll, getDatetime, getSourceUrl
} from "@inrupt/solid-client";
import { DatasetContext, SessionProvider, Table, TableColumn, ThingProvider, useThing, useSession, useDataset } from "@inrupt/solid-ui-react";
import { useContext } from "react";
import MsgThing from "../MsgThing";
import { SMAIL } from "../../SMAIL";

function getSubject(url, fs) {
    getSolidDataset(url, { fs }).then(m => console.log("m", m));
    return true;
}

function DirListing(props) {

    const session = props.session;
    const dir_url = props.dir_url;

    const dir_messages = Object.keys(props['inboxDataset']['graphs']['default']).slice(1);

    return (<div>hello from inboxListing with props
        <br />
        {/* props dataset: {JSON.stringify(props['inboxDataset'])} */}
        <ul>
            {dir_messages.map(url =>
                <li>{getSubject(url, props.f) && url}</li>
            )}
        </ul>

    </div>);
}

export default DirListing;
