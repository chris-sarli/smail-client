import {
    getSolidDataset, getThing, getStringNoLocale, getStringEnglish, getLiteral, getThingAll
} from "@inrupt/solid-client";
import { DatasetContext, Table, TableColumn, ThingProvider, useThing, ThingContext, useSession } from "@inrupt/solid-ui-react";
import { useContext } from "react";
const { SMAIL } = require('../../SMAIL');

function doit(url, s) {
    let subj = "loading subject..."
    // getSolidDataset(url, { fetch: s.fetch }).then(d => console.log("d", d['graphs']['default'][url.replaceAll("%40", "@")]["predicates"]));
    getSolidDataset(url, { fetch: s.fetch }).then(ds => {
        console.log("ds", ds)
        const thing = getThingAll(ds, url, { fetch: s.fetch });
        console.log('thing', thing[0]['predicates'][SMAIL.subject], getStringNoLocale(thing[0], SMAIL.subject));
    });
    return subj;
}

function MsgThing(props) {

    // const thing = useThing("https://chris-sarli.inrupt.net/smail/inbox/", "https://chris-sarli.inrupt.net/smail/inbox/0999a003-f4d5-4c20-b59e-67c3d1d24e19%40Spark");
    // console.log("thinnnngg", thing)

    // const { fetchSession } = useSession();


    // console.log("try", get);

    // const real = getSolidDataset("https://chris-sarli.inrupt.net/smail/inbox/", "https://chris-sarli.inrupt.net/smail/inbox/04b00f7a-f09a-4201-a283-caa3fc1cb2e0%40Spark", { session: fetchSession });

    // real.then(v => {
    //     console.log("v", v);
    // })



    return (<p>{doit("https://chris-sarli.inrupt.net/smail/inbox/bfd521a5-ce44-45fa-93ba-9fc897217058%40Spark", props.session)}</p>);
}

export default MsgThing;
