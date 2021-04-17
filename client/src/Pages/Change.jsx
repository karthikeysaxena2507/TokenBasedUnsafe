import React, { useEffect, useState } from "react";
import axios from "axios";
import Logout from "../Components/Logout";
import Data from "../Components/Data";
import Heading from "../Components/Heading";
import Button from "../Components/Button";
import ChangePassword from "../Components/ChangePassword";

const Change = () => {

    // CREATING OUR STATE VARIABLES
    const [username, setUsername] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [message, setMessage] = useState("");
    const [newPassword, setNewPassword] = useState("");

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
    
    // RETURNING DATA OF COMPONENT ON PAGE
    return (
    <div className="text-center up ml-5 mr-5">
        <Heading content = "Change Your Password"/>
        <Button route = "/home" content = "Home" />
        <Button route = "/xss" content = "XSS Attack" />
        <Logout username = {username} />
        <div>
            <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password" 
                className="mt-3 pt-2 pb-2 pr-2 pl-2"
                required 
            />
        </div>
        <ChangePassword newPassword = {newPassword} username = {username} />
        <h5 className="mt-3"> {message} </h5>
        <Data accessToken = {accessToken} refreshToken = {refreshToken} />
    </div>
    );
}

export default Change;