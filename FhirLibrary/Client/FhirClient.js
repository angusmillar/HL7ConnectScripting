/**
 The RestClient script handles the RESTFul HTTP communications with ICIMS.
 All the HTTP Headers and retry timeout variables are contained within this script.
*/

function FhirClient() {

  //Creates a new REST POST object instance  
  this.POST = function (EndPoint, EndPointMethod, AuthorizationToken, Payload) {
    return new POST(EndPoint, EndPointMethod, AuthorizationToken, Payload);
  };


  //POST class collects data returned by the POST call
  function POST(EndPoint, EndPointMethod, AuthorizationToken, Payload) {
    // The data returned in the body of the call */
    this.DataReceived = "";
    // The Http Status code returned by the call*/
    this.HttpStatus = 0;
    // Returns true if an error was encountered in making the call*/
    this.Error = false;
    // Returns an error message when Error = true*/
    this.ErrorMessage = "";

    var DBG_Serious = 2;
    var Data = Payload;
    var Url = EndPoint + "/" + EndPointMethod;
    var Token = AuthorizationToken;
    var CallMade = new MakePOSTCall(Data, Url, Token, 0);

    BreakPoint;
    if (CallMade.Error) {
      //Fatal error after many attempts
      BreakPoint;
      this.Error = true;
      this.ErrorMessage = CallMade.ErrorMessage.replace("\r", "").replace("\n", "")
      this.DataReceived = "";
      this.HttpStatus = 0;
    }
    else {
      this.DataReceived = CallMade.DataReceived;
      this.HttpStatus = CallMade.HttpStatus;
      this.Error = CallMade.Error;
    }
  }

  /**
   Make POST Call class performs the call to the REST service.
   This is called recursively is the network connection is down for a max count of 'Attempts'   
  */
  function MakePOSTCall(Data, Endpoint, Token, Attempts) {
    //The data returned in the body of the call */
    this.DataReceived = "";
    //The Http Status code returned by the call*/
    this.HttpStatus = 0;
    //Returns true if an error was encountered in making the call*/
    this.Error = false;
    //Returns an error message when Error = true*/
    this.ErrorMessage = "";
    //HL7 Connect category of error
    var DBG_Serious = 2;
    //RetryTime - The amount of time to wait before trying the connection again
    //Never set retry below 1000 (1 sec)  
    this.RetryTime = 1000;
    //MaxAttempts - The max number of times to try connecting again before giving up     
    var MaxAttempts = 1;
    var xmlhttp = new ActiveXObject("MSXML2.ServerXMLHTTP");
    //Set Request Timeouts: The setTimeouts method should be called before the open method. None of the parameters is optional.

    /**
    resolveTimeout:
    A long integer. The value is applied to mapping host names (such as "www.microsoft.com") to 
    IP addresses; the default value is infinite, meaning no timeout.
 
    connectTimeout:
    A long integer. The value is applied to establishing a communication socket with the target 
    server, with a default timeout value of 60 seconds.
 
    sendTimeout:
    A long integer. The value applies to sending an individual packet of request data (if any) 
    on the communication socket to the target server. A large request sent to a server will normally be broken up into multiple packets; 
    the send timeout applies to sending each packet individually. The default value is 30 seconds.
 
    receiveTimeout:
    A long integer. The value applies to receiving a packet of response data from the target server. 
    Large responses will be broken up into multiple packets; the receive timeout applies to fetching each packet of data off the socket. 
    The default value is 30 seconds.
 */
    var resolveTimeout = 5 * 1000;
    var connectTimeout = 5 * 1000;
    var sendTimeout = 60 * 1000;
    var receiveTimeout = 60 * 1000;
    xmlhttp.setTimeouts(resolveTimeout, connectTimeout, sendTimeout, receiveTimeout);

    xmlhttp.open("POST", Endpoint, false);

    //Set Requst HTTP Headers       
    xmlhttp.setRequestHeader("Content-Type", "application/fhir+json");
    xmlhttp.setRequestHeader("User-Agent", "HL7Connect/" + Kernel.Version());
    xmlhttp.setRequestHeader("Connection", "keep-alive");
    xmlhttp.setRequestHeader("Accept", "application/fhir+json");
    //ToDo: we are just assuming that the V2 message is UTF-8, it may be just ASCII.
    //At this point we do not control UTF-8 or not that is controled by the PAS system
    //that generates the messages.
    //Although ASCII fits into UTF-8 below 128, I think.
    xmlhttp.setRequestHeader("Content-Length", lengthInUtf8Bytes(Data));
    if (Token != "") {
      xmlhttp.setRequestHeader("Authorization", Token);
    }

    try {
      BreakPoint;
      xmlhttp.send(Data);
      this.HttpStatus = xmlhttp.status;
      this.DataReceived = xmlhttp.responseText;
      this.Error = false;
      this.ErrorMessage = "";
    }
    catch (err) {
      Kernel.WriteToLog(DBG_Serious, "FHIR Rest client Error!");
      Kernel.WriteToLog(DBG_Serious, "FHIR client Error: " + err.message.replace("\r", "").replace("\n", ""));
      if (!Attempts || Attempts < MaxAttempts) {
        Kernel.WriteToLog(DBG_Serious, "FHIR client Retry: " + ((Attempts || 0) + 1) + " ... In " + (this.RetryTime / 1000) + "secs");
        //Wait RetryTime amount before trying again!
        Delay(this.RetryTime);
        var TryAgainMakePOSTCall = new MakePOSTCall(Data, Endpoint, Token, (Attempts || 0) + 1);
        this.HttpStatus = TryAgainMakePOSTCall.HttpStatus;
        this.DataReceived = TryAgainMakePOSTCall.DataReceived;
        this.Error = TryAgainMakePOSTCall.Error;
        this.ErrorMessage = TryAgainMakePOSTCall.ErrorMessage;
      }
      else {
        Kernel.WriteToLog(DBG_Serious, "FHIR client to many attempts.");
        this.Error = true;
        this.ErrorMessage = "FHIR client Error:" + err.message;
      }
    }
  }

  //Calculate the HTTP body size in bytes  
  function lengthInUtf8Bytes(str) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
  }
}