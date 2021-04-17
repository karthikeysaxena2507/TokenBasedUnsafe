/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import axios from "axios";
import Logout from "../Components/Logout";
import Data from "../Components/Data";
import Heading from "../Components/Heading";
import Button from "../Components/Button";
import InnerHTML from 'dangerously-set-html-content'

const Xss = () => {

    const example1 = "<script> alert(document.cookie) </script>";
    const example2 = "<scri<script>pt> alert(document.cookie) </script>";
    const example3 = `<img src onerror="alert(document.cookie)">`;

    // CREATING OUR STATE VARIABLES
    const [username, setUsername] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [message, setMessage] = useState("");
    const [lowText, setLowText] = useState("");
    const [medText, setMedText] = useState("");
    const [highText, setHighText] = useState("");
    const [lowHtmlText, setLowHtmlText] = useState("");
    const [medHtmlText, setMedHtmlText] = useState("");
    const [highHtmlText, setHighHtmlText] = useState("");

    // USE-EFFECT REACT HOOK TO CHECK AUTH STATUS AND GET DATA
    useEffect(() => {
        const check = async() => {
            try {
                const renewAccessToken = async() => {
                    const response = await axios.get("/users/auth");
                    setAccessToken(response.data.accessToken);
                    setRefreshToken(response.data.refreshToken);
                    if(response.data === "INVALID") {
                        clearInterval(interval);
                        window.location = "/";
                    }
                    else {
                        setMessage("Changing Access Token ...");
                        setUsername(response.data.username);
                        const result = await axios.post("/users/accesstoken", {username: response.data.username});
                        setAccessToken(result.data.accessToken);
                        setMessage("");
                    }
                }
                const deleteRefreshToken = async() => {
                    const response = await axios.get("/users/auth");
                    if(response.data !== "INVALID") {
                        await axios.post("/users/logout", {username: response.data.username});
                    }
                    window.location = "/";
                }
                renewAccessToken();
                const interval = setInterval(() => renewAccessToken(), 60*1000); // 30 secs
                const timer = setTimeout(() => deleteRefreshToken(), 300*1000); // 3 mins
                return () => {
                    clearInterval(interval);
                    clearTimeout(timer);
                }
            }
            catch(err) {
                console.log(err);
            }
        }   
        check(); 
    },[]);

    const sendLow = () => {
        setLowHtmlText(lowText);
    }

    const sendMed = () => {
        setMedHtmlText(medText.replace("<script>", ""));
    }
    
    const sendHigh = () => {
        setHighHtmlText(highText.replace(/<.*?script.*?>.*?<\/.*?script.*?>/igm, ''));
    }
    
    // RETURNING DATA OF COMPONENT ON PAGE
    return (
    <div className="text-center up ml-5 mr-5">
        <Heading content = "XSS Attack" />
        <Button route = "/home" content = "Home" />
        <Button route = "/change" content = "Change Password" />
        <Logout username = {username} />
        <div className="mt-3">
            <h2> LEVEL - 1 </h2>
            <div>
                <input 
                    type="text" 
                    value={lowText}
                    onChange={(e) => setLowText(e.target.value)}
                    placeholder="Random Text" 
                    autoComplete="off" 
                    className="mt-3 pt-2 pb-2 pr-2 pl-2"
                    required 
                />
            </div>
            Example: {example1}
            <div className="mt-2"> <InnerHTML html = {lowHtmlText} /> </div>
            <button className="btn btn-dark mt-3" onClick={() => sendLow()}> Submit Text </button> 
        </div>
        <div className="mt-3">
            <h2> LEVEL - 2 </h2>
            <div>
                <input 
                    type="text" 
                    value={medText}
                    onChange={(e) => setMedText(e.target.value)}
                    placeholder="Random Text" 
                    autoComplete="off" 
                    className="mt-3 pt-2 pb-2 pr-2 pl-2"
                    required 
                />
            </div>
            Example: {example2}
            <div className="mt-2"> <InnerHTML html = {medHtmlText} /> </div>
            <button className="btn btn-dark mt-3" onClick={() => sendMed()}> Submit Text </button> 
        </div>
        <div className="mt-3">
            <div>
                <h2> LEVEL - 3 </h2>
                <input 
                    type="text" 
                    value={highText}
                    onChange={(e) => setHighText(e.target.value)}
                    placeholder="Random Text" 
                    autoComplete="off" 
                    className="mt-3 pt-2 pb-2 pr-2 pl-2"
                    required 
                />
            </div>
            Example: {example3}
            <div className="mt-2"> <InnerHTML html = {highHtmlText} /> </div>
            <button className="btn btn-dark mt-3" onClick={() => sendHigh()}> Submit Text </button> 
        </div>
        <h5 className="mt-3"> {message} </h5>
        <Data accessToken = {accessToken} refreshToken = {refreshToken} />
    </div>
    );
}

export default Xss;