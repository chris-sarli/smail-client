
import { useSession, SessionProvider, LoginButton, LogoutButton, LinkButton, useDataset, DatasetProvider } from "@inrupt/solid-ui-react";
import { getThingAll, getFile, getStringNoLocale, getThing, getSolidDataset } from "@inrupt/solid-client";
import { useState, useEffect } from "react";
import DirListComponent from "../dirList";
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import MessageView from "../messageView";
import Composer from "../composer";


/* eslint react/prop-types: 0 */
function AppContainer({ children }) {

    const [idp, setIdp] = useState("https://inrupt.net");
    // const [currentUrl, setCurrentUrl] = useState("http://localhost:3000");
    const { session, sessionRequestInProgress, fetch } = useSession();
    const us = useSession();

    const loggedIn = session.info.isLoggedIn;

    const base = loggedIn ? session.info.webId.slice(0, session.info.webId.length - "profile/card#me".length) : "";
    const inboxIri = base + "smail/inbox/";
    const outboxIri = base + "smail/outbox/";

    const { dataset, error } = useDataset(inboxIri);


    return (
        <div className="app-container">
            <BrowserRouter>
                <div className="nav">
                    <div className="nav-content">
                        <h1 className="nav-title">Smail</h1>
                        <Link to="/compose"><button className="compose-button" disabled={!session.info.isLoggedIn}>Compose</button></Link>
                        <ul className={'nav-items ' + (!session.info.isLoggedIn ? 'disabled' : '')}>
                            <li><Link to="/">Inbox</Link></li>
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
                                    redirectUrl={window.location.href}
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
                                redirectUrl={window.location.href}
                                onError={console.error}
                            />
                        </div>

                    }
                    {!sessionRequestInProgress && loggedIn &&
                        <Routes>
                            <Route path="message/*" element={
                                <MessageView session={session}></MessageView>
                            }></Route>
                            <Route path="compose/" element={
                                <Composer session={session} outboxIri={outboxIri}></Composer>
                            }></Route>
                            <Route path="/" element={
                                <DirListComponent dir_url="https://chris-sarli.inrupt.net/smail/inbox/" session={session} />
                            }></Route>
                        </Routes>
                    }

                </div>
            </BrowserRouter>
        </div >
    );
}

export default AppContainer;
