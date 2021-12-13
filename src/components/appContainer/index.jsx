
import { useSession, SessionProvider, LoginButton, LogoutButton, LinkButton, useDataset, DatasetProvider } from "@inrupt/solid-ui-react";
import { getThingAll, getFile, getStringNoLocale, getThing, getSolidDataset } from "@inrupt/solid-client";
import { useState, useEffect } from "react";
import DirListing from "../dirList";
import { SMAIL } from "../../SMAIL";
import MsgThing from "../MsgThing";

function doit(s) {
    getSolidDataset("https://chris-sarli.inrupt.net/smail/inbox/bfd521a5-ce44-45fa-93ba-9fc897217058%40Spark", { fetch: s.fetch }).then(d => console.log("d", d));
    return "loaded";
}

/* eslint react/prop-types: 0 */
function AppContainer({ children }) {

    const [idp, setIdp] = useState("https://inrupt.net");
    const [currentUrl, setCurrentUrl] = useState("http://localhost:3000");
    const { session, sessionRequestInProgress, fetch } = useSession();
    const us = useSession();

    const loggedIn = session.info.isLoggedIn;

    const base = loggedIn ? session.info.webId.slice(0, session.info.webId.length - "profile/card#me".length) : "";
    const inboxIri = base + "smail/inbox/";

    const { dataset, error } = useDataset(inboxIri);



    return (
        <div className="app-container">
            <div className="nav">
                <div className="nav-content">
                    <h1 className="nav-title">Smail</h1>
                    <button className="compose-button" disabled={!session.info.isLoggedIn}>Compose</button>
                    <ul className={'nav-items ' + (!session.info.isLoggedIn ? 'disabled' : '')}>
                        <li>Inbox</li>
                        <li>Archive</li>
                        <li>Drafts</li>
                        <li>Sent</li>
                    </ul>
                </div>
                <div className="account">
                    {sessionRequestInProgress && <em>Logging in...</em>}

                    {!sessionRequestInProgress && session.info.isLoggedIn && (
                        <div>
                            <div className="lia">
                                Logged in as <strong><a href={session.info.webId} target="_blank">{session.info.webId}</a></strong></div>
                            < br />
                            <LogoutButton
                                onError={console.error}
                                onLogout={() => window.location.reload()}
                            />
                        </div>
                    )}

                    {!sessionRequestInProgress && !loggedIn &&
                        <div className="login-message">
                            You are not currently logged in.
                            <LoginButton
                                authOptions={{ clientName: "Smail" }}
                                oidcIssuer={idp}
                                redirectUrl={currentUrl}
                                onError={console.error}
                            /></div>}
                </div>
            </div>
            <div className="main">
                {!sessionRequestInProgress && !loggedIn &&

                    <div className="main-login-message">
                        Please log in to a Solid Pod to use this Smail client.
                        <br />
                        <br />
                        <LoginButton
                            authOptions={{ clientName: "Smail" }}
                            oidcIssuer={idp}
                            redirectUrl={currentUrl}
                            onError={console.error}
                        />
                    </div>

                }
                {!sessionRequestInProgress && loggedIn &&
                    function () {
                        if (error) return <div>failed to load</div>;
                        if (!dataset) return <div>loading...</div>;
                        // return <InboxListing inboxDataset={dataset} f={us} />;
                        return <MsgThing session={session} />
                    }()
                }

            </div>
        </div >
    );
}

export default AppContainer;
