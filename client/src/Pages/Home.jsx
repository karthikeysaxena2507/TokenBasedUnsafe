import React, { useEffect, useState } from "react";
import axios from "axios";
import Logout from "../Components/Logout";
import Data from "../Components/Data";
import Heading from "../Components/Heading";
import Button from "../Components/Button";

const Home = () => {

    // CREATING OUR STATE VARIABLES
    const [username, setUsername] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [message, setMessage] = useState("");

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
        <Heading content = "Home Page" />
        <Button route = "/change" content = "Change Password" />
        <Button route = "/xss" content = "XSS Attack" />
        <Logout username = {username} />
        <h5 className="mt-3"> {message} </h5>
        <Data accessToken = {accessToken} refreshToken = {refreshToken} />
    </div>
    );
}

export default Home;