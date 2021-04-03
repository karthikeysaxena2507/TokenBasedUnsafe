import React, { useEffect, useState } from "react";
import axios from "axios";
import Logout from "../Components/Logout";
import Data from "../Components/Data";
import Heading from "../Components/Heading";
import Button from "../Components/Button";

const Home = () => {

    const [username, setUsername] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const check = async() => {
            try {
                const renewAccessToken = async() => {
                    const response = await axios.get("/users/auth");
                    console.log(response.data);
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
                const interval = setInterval(() => renewAccessToken(), 30*1000); // 10 secs
                const timer = setTimeout(() => deleteRefreshToken(), 60*60*1000); // 1 hr
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