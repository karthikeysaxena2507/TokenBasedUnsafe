import React from "react";
import axios from "axios";

const Logout = (props) => {

    const logout = async() => {
        try {
            await axios.post("/users/logout", {username: props.username});
            window.location = "/";
        }
        catch(err) {
            console.log(err);
        }
    }

    return <button onClick={() => logout()} className="btn btn-dark mr-3 mt-3"> logout </button>
}

export default Logout;