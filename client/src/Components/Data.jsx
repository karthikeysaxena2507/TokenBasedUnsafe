import React from "react";

/**
 * @param {Object} props 
 * @returns Data functional component
 */
const Data = (props) => {
    return (<div className="mt-3 mb-5 text-left">
        <h4> Current Access Token:</h4> {props.accessToken}
        <h4> Current Refresh Token: </h4> {props.refreshToken}
    </div>);
}

export default Data;