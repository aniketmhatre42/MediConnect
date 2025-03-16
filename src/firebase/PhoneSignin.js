import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css'
import "./phone.css"
import { MdTextFields } from "react-icons/md";
import { GiSmallFire } from "react-icons/gi";
import {
    multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator,
    RecaptchaVerifier
} from "firebase/auth";
import { signInWithPhoneNumber } from "firebase/auth";
import * as firebaseui from 'firebaseui'
import {initializeApp} from 'firebase/app'
import {getAuth} from 'firebase/auth'

 function PhoneSignin() {

    const [phone,setPhone] = useState("")
    const [user, setUser] = useState("")
    const [otp, setOtp] =useState ("")
    const auth = getAuth()

    // const sendOtp =async()=>{
    //     try{
    //         const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container-id', undefined, auth);
    //         multiFactor(user).getSession()
    //             .then(function (multiFactorSession) {
    //                 // Specify the phone number and pass the MFA session.
    //                 const phoneInfoOptions = {
    //                     phoneNumber: phone,
    //                     session: multiFactorSession
    //                 };
            
    //                 const phoneAuthProvider = new PhoneAuthProvider(auth);
            
    //                 // Send SMS verification code.
    //                 return phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
    //             }).then(function (verificationId) {
    //                 // Ask user for the verification code. Then:
    //                 const cred = PhoneAuthProvider.credential(verificationId, otp);
    //                 const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
            
    //                 // Complete enrollment.
    //                 return multiFactor(user).enroll(multiFactorAssertion, "mfaDisplayName");
    //             });
    //         // const confirmation = signInWithPhoneNumber(auth,phone,recaptcha)
    //         // setUser(confirmation)
    //     }catch(err){
    //         console.error(err)
    //     }
      
    // }

    // const verifyOtp=async()=>{
    //     try{
    //         const data = await user.confirm(otp)
    //         console.log(data)
    //     }catch(err)
    //     {
    //         console.error(err) 
    //     }
        
        
    // }

    React.useEffect(()=>{
        const uiConfig = {
            signInSuccessUrl: "http://localhost:3000/", //This URL is used to return to that page when we got success response for phone authentication.
            signInOptions: [auth.PhoneAuthProvider.PROVIDER_ID],
            tosUrl: "http://localhost:3000/"
          };
          var ui = new firebaseui.auth.AuthUI(auth);
          ui.start("#firebaseui-auth-container", uiConfig);
    },[])

    return (
        // <div className="phone-signin">
        //     <div className="phone-content">
        //     <PhoneInput
        //         country={'us'}
        //          value={phone}
        //          onChange={(phone)=>setPhone("+"  + phone  )}
        //     />
        // <button onClick={sendOtp} sx= {{marginTop:"10px"}}   variant='contained '>Send OTP </button>
        // <div style={{marginTop:"10px"}}  id=" recaptcha">

        // </div>
        // <br/>

        // <input onChange={(e)=> setOtp(e.target.value)}  aria-label="Enter OTP "/>
        // <br/>
        //     <button onClick={verifyOtp} sx={{marginTop:"10px"}}   variant="contained" color="success ">Verify OTP</button>
        //     </div>
            
        // </div> 
        <div id="firebaseui-auth-container"></div>
 ) 
}

export default PhoneSignin