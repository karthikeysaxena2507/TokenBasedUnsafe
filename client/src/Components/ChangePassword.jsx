import React from "react";
import axios from "axios";

const  ChangePassword = (props) => {

    const change = async() => {
        try {
            await axios.post("/users/change", {username: props.username, newPassword: props.newPassword});
            window.location = "/home";
        }
        catch(err) {
            console.log(err);
        }
    }

    return <button onClick={() => change()} className="btn btn-dark mr-3 mt-3"> Change Password </button>
}

export default ChangePassword;