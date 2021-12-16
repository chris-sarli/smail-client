
import { useSession, SessionProvider, LoginButton, LogoutButton, LinkButton, useDataset, DatasetProvider } from "@inrupt/solid-ui-react";
import { getThingAll, getFile, getStringNoLocale, getThing, getSolidDataset, createThing, addStringNoLocale, createSolidDataset, addInteger, addBoolean, setThing, saveSolidDatasetAt } from "@inrupt/solid-client";
import { useState, useEffect } from "react";
import DirListComponent from "../dirList";
import { BrowserRouter, Route, Routes, Link, Navigate } from 'react-router-dom';
import MessageView from "../messageView";
import Editor from "../editor";
import { addMessageToDirIndex } from "../../util/message";
import { SMAIL } from "../../SMAIL";

function generateNewId() {
    return (new Date().getTime()).toString() + "-" + Math.round(Math.random() * Math.random() * 10000 * (new Date().getTime())).toString() + "@smail-client";
}

async function newMessage(baseUrl, session, replyingTo = undefined) {
    const newMessageId = generateNewId();
    const newMessageUrl = baseUrl + "messages/" + newMessageId;

    let newMessage = createThing({ name: newMessageId, url: newMessageUrl });
    newMessage = addStringNoLocale(newMessage, SMAIL.messageId, newMessageId);
    newMessage = addStringNoLocale(newMessage, SMAIL.from, "test@chris.sarl");
    newMessage = addStringNoLocale(newMessage, SMAIL.to, "");
    newMessage = addStringNoLocale(newMessage, SMAIL.subject, "");
    newMessage = addInteger(newMessage, SMAIL.timestamp, Math.round((new Date()).getTime()));
    newMessage = addStringNoLocale(newMessage, SMAIL.body, "");
    newMessage = addBoolean(newMessage, SMAIL.is_read, true);

    newMessage = addStringNoLocale(newMessage, SMAIL.directory, baseUrl + "dir/drafts.json");

    if (replyingTo != undefined) {
        newMessage = addStringNoLocale(newMessage, SMAIL.replyingTo, replyingTo);
    }

    const newMessageDataset = setThing(createSolidDataset(), newMessage);

    await Promise.all([saveSolidDatasetAt(newMessageUrl, newMessageDataset, { fetch: session.fetch }),
    addMessageToDirIndex(newMessageUrl, newMessage, baseUrl + "dir/drafts.json", { fetch: session.fetch })]);

    return newMessageUrl;
}

/* eslint react/prop-types: 0 */
function AppContainer({ children }) {

    const [idp, setIdp] = useState("https://inrupt.net");
    // const [currentUrl, setCurrentUrl] = useState("http://localhost:3000");
    const { session, sessionRequestInProgress, fetch } = useSession();
    const us = useSession();

    const loggedIn = session.info.isLoggedIn;

    // const base = loggedIn ? session.info.webId.slice(0, session.info.webId.length - "profile/card#me".length) : "";
    const base = "https://chris-sarli.inrupt.net/smail/chris.sarl/test/"
    let currentView = "";

    return (
        <div className="app-container">
            <BrowserRouter>
                <div className="nav">
                    <div className="nav-content">
                        <h1 className="nav-title">Smail</h1>
                        <button className="compose-button" disabled={!session.info.isLoggedIn} onClick={() => newMessage(base, session)}>Compose</button>
                        <ul className={'nav-items ' + (!session.info.isLoggedIn ? 'disabled' : '')}>
                            <Link to="/" onClick={() => { currentView = "inbox" }}><li>Inbox</li></Link>
                            <Link to="/dir/archive"><li>Archive</li></Link>
                            <Link to="/dir/drafts"><li>Drafts</li></Link>
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
                            <Route path="edit/*" element={
                                <Editor session={session} base={base}></Editor>
                            }></Route>
                            <Route path="/" element={
                                <Navigate to="/dir/inbox" />
                            }></Route>
                            {/* <Route path="/dir/*" element={
                                <DirListComponent dirs_url={base + "dir/"} dir={window.location.pathname.slice("/dir/".length)} session={session} />
                            }></Route> */}
                            <Route path="/dir/inbox" element={
                                <DirListComponent key="inbox" dirs_url={base + "dir/"} dir="inbox" session={session} />
                            }></Route>
                            <Route path="/dir/archive" element={
                                <DirListComponent key="archive" dirs_url={base + "dir/"} dir="archive" session={session} />
                            }></Route>
                            <Route path="/dir/drafts" element={
                                <DirListComponent key="drafts" dirs_url={base + "dir/"} dir="drafts" editOnClick={true} showRecipients={true} session={session} />
                            }></Route>
                        </Routes>
                    }

                </div>
            </BrowserRouter>
        </div >
    );
}

export default AppContainer;
