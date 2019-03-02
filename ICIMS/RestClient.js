/**
 * @module
 * @description The RestClient script handles the RESTFul HTTP communications with ICIMS.
 * All the HTTP Headers and retry timeout variables are contained within this script.
*/

/**
 * @class
 * @constructor
 * @param {string} EndPoint The url that is the endpoint for the REST POST call
 * @param {string} EndPointMethod The Method to be called at the endpoint
 * @param {string} AuthorizationToken The Authorization Token to be set inthe HTTP Header 'Authorization'
 * @param {string} Payload The data to be sent in the Body of the HTTP call
 */

function RestClient()
{
  /** @function
   * @description Creates a new REST POST object instance
   * @param {string} EndPoint The endpoint url for the REST service
   * @param {string} EndPointMethod The Method at the endpoint to be called
   * @param {string}  AuthorizationToken - The static Authorization Token to be set in the HTTP Header property 'Authorization'
   * @param {string} Payload The data to be placed in the body of the HTTP call
   * @returns {object} POST
  */
  this.POST = function(EndPoint, EndPointMethod, AuthorizationToken, Payload)
  {
    return new POST(EndPoint, EndPointMethod, AuthorizationToken, Payload);
  };

  /**
   * @description POST class collects data returned by the POST call
   * @function
   * @constructor
   * @param {string} EndPoint The endpoint url for the REST service
   * @param {string} EndPointMethod The Method at the endpoint to be called
   * @param {string}  AuthorizationToken - The static Authorization Token to be set in the HTTP Header property 'Authorization'
   * @param {string} Payload The data to be placed in the body of the HTTP call
   * @returns {object} POST
   * @inner
  */
  function POST(EndPoint, EndPointMethod, AuthorizationToken, Payload)
  {
    /** @property {string} DataReceived - The data returned in the body of the call */
    this.DataReceived = "";
    /** @property {string} HttpStatus - The Http Status code returned by the call*/
    this.HttpStatus = 0;
    /** @property {boolean} Error - Returns true if an error was encountered in making the call*/
    this.Error = false;
    /** @property {string} ErrorMessage - Returns an error message when Error = true*/
    this.ErrorMessage = "";

    var DBG_Serious = 2;
    var Data = Payload;
    var Url = EndPoint + "/" + EndPointMethod;
    var Token = AuthorizationToken;
    var CallMade = new MakePOSTCall(Data, Url, Token, 0);

    BreakPoint;
    if (CallMade.Error)
    {
      //Fatal error after many attempts
      BreakPoint;
      this.Error = true;
      this.ErrorMessage = CallMade.ErrorMessage.replace("\r", "").replace("\n", "")
      this.DataReceived = "";
      this.HttpStatus = 0;
    }
    else
    {
      this.DataReceived = CallMade.DataReceived;
      this.HttpStatus = CallMade.HttpStatus;
      this.Error = CallMade.Error;
    }
  }

  /**
   * @description Make POST Call class performs the call to the REST service.
   * This is called recursively is the network connection is down for a max count of 'Attempts'
   * @function
   * @constructor
   * @param {string} Data The data to be placed in the body of the HTTP call
   * @param {string} EndPoint The endpoint url for the REST service
   * @param {string} Token - The static Authorization Token to be set in the HTTP Header property 'Authorization'
   * @param {string} Attempts The max attempts to be made if the network connection is down
   * @returns {object} MakePOSTCall
   * @inner
  */
  function MakePOSTCall(Data, Endpoint, Token, Attempts)
  {
   /** @property {string} DataReceived - The data returned in the body of the call */
   this.DataReceived = "";
   /** @property {string} HttpStatus - The Http Status code returned by the call*/
   this.HttpStatus = 0;
   /** @property {boolean} Error - Returns true if an error was encountered in making the call*/
   this.Error = false;
   /** @property {string} ErrorMessage - Returns an error message when Error = true*/
   this.ErrorMessage = "";

   var DBG_Serious = 2;
   /**
     * @property {integer} RetryTime - The amount of time to wait before trying the connection again
     * Never set retry below 1000 (1 sec)
     * @default
    */
   this.RetryTime = 1000;
    /**
     * @property {integer} MaxAttempts - The max number of times to try connecting again before giving up
     * @default
    */
   var MaxAttempts = 1;
   var xmlhttp = new ActiveXObject("MSXML2.ServerXMLHTTP");

   xmlhttp.open("POST", Endpoint, false);

   //Set Requst HTTP Headers
   BreakPoint;
  // xmlhttp.setRequestHeader("Content-Type", "application/json; charset=utf-8");
   xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
   xmlhttp.setRequestHeader("User-Agent", "HL7Connect/" + Kernel.Version());
   xmlhttp.setRequestHeader("Connection", "keep-alive");
   xmlhttp.setRequestHeader("Accept", "*/*");
   //ToDo: we are just assuming that the V2 message is UTF-8, it may be just ASCII.
   //At this point we do not control UTF-8 or not that is controled by the PAS system
   //that generates the messages.
   //Although ASCII fits into UTF-8 below 128, I think.
   xmlhttp.setRequestHeader("Content-Length", lengthInUtf8Bytes(Data));
   if (Token != "")
   {
     xmlhttp.setRequestHeader("Authorization", Token);
   }
   //Set Request Timeouts
   xmlhttp.setTimeouts(5000, 60000, 10000, 10000);

   try
   {
     //Kernel.WriteToLog(DBG_Serious, "ICIMS Send! Send!");
     xmlhttp.send(Data);
     this.HttpStatus = xmlhttp.status;
     this.DataReceived = xmlhttp.responseText;
     this.Error = false;
     this.ErrorMessage = "";
   }
   catch (err)
   {
     Kernel.WriteToLog(DBG_Serious, "ICIMS Rest client Error!");
     Kernel.WriteToLog(DBG_Serious, "ICIMS Error: " + err.message.replace("\r", "").replace("\n", ""));
     if (!Attempts || Attempts < MaxAttempts)
     {
       Kernel.WriteToLog(DBG_Serious, "ICIMS Retry: " + ((Attempts || 0) + 1) + " ... In " + (this.RetryTime / 1000) + "secs");
       //Wait RetryTime amount before trying again!
       Delay(this.RetryTime);
       var TryAgainMakePOSTCall = new MakePOSTCall(Data, Endpoint, Token, (Attempts || 0) + 1);
       this.HttpStatus = TryAgainMakePOSTCall.HttpStatus;
       this.DataReceived = TryAgainMakePOSTCall.DataReceived;
       this.Error = TryAgainMakePOSTCall.Error;
       this.ErrorMessage = TryAgainMakePOSTCall.ErrorMessage;
     }
     else
     {
       Kernel.WriteToLog(DBG_Serious, "ICIMS Too many attempts.");
       this.Error = true;
       this.ErrorMessage = "ICIMS Error:" + err.message;
     }
   }
  }
  
  /** @function
   * @param {string} str Calculate the HTTP body size in bytes
   * @returns {integer}
  */
  function lengthInUtf8Bytes(str) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
  }
}