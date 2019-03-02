
//Debugging
<%include $safe$\ICIMS\BusinessModels.js%>
<%include $safe$\ICIMS\IcimsInterfaceModels.js%>
<%include $safe$\ICIMS\RestClient.js%>
<%include $safe$\ICIMS\Json2.js%>


/**
 * @module
 * @description The IcimsRunner script is the entry point for HL7 Connect.
 * This script is to be referanced on a HL7 Connect outgoing scripted interface with the procedure name
 * '<code>IcimsRunner</code>' and a single parameter equal to one of the 'SiteContextEnum' values <code>'RMH'</code> for example.
*/

/**
 * @class
 * @classdesc The main entry point for HL7 Connect on fireing the OnScriptSend event.
 * @requires module:BusinessModels.js
 * @requires module:IcimsInterfaceModels.js
 * @requires module:RestClient.js
 * @requires module:Json2.js
 * @constructor
 * @param {event} OnScriptSend The event passed in by HL7 Connect
 */
function IcimsRunner(aEvent)
{
  BreakPoint;
   var Models = new BusinessModels(SiteContext);

   //Validate and set the site context for the script
   //This is so the script can be adjusted for new sites as required.
   //For instance the string "RMH" must be passed in as a script parameter from HL7 Connect.
   var SiteContext = ValidateSiteContext(aEvent.Parameter);

   //=========== Per site Configuration ========================================
   var FacilityConfiguration = null;
   switch(SiteContext) {
    case SiteContextEnum.RMH:
        //The Site Context enum we are running the script under
        FacilityConfiguration = Models.FacilityConfiguration(SiteContext);
        //PrimaryMRNAssigningAuthority - This is used for Patient Merges and to colllect the single MRN wiht this AssigningAuthority code
        FacilityConfiguration.PrimaryMRNAssigningAuthority = "RMH";
        //EndPoint - The REST endpoint url for ICIMS

        //FacilityConfiguration.EndPoint = "http://mhicimsprod.ssg.org.au/staging/api/pas.py";
        FacilityConfiguration.EndPoint = "http://localhost:60823/api/mock";
                
        //AuthorizationToken - The static Authorization Token to make the REST call against ICIMS service.
        //Production Token
        //FacilityConfiguration.AuthorizationToken = = "Basic aGw3OmlDSU1TMjBsNw==";
        //Test Token
        FacilityConfiguration.AuthorizationToken = "Basic aGw3dGVzdDppY2ltczIwMTc=";
        //NameOfInterfaceRunnningScript - The name of the HL7 Connect interface this script is triggered from
        FacilityConfiguration.NameOfInterfaceRunnningScript = "IcimsScriptOutboundProd";
        //MaxRejectBeforeInterfaceStop  - The number of Reject counts before the interface will stop, these are the red errors on the HL7Connect status page
        FacilityConfiguration.MaxRejectBeforeInterfaceStop = 20;
        Models.FacilityConfig = FacilityConfiguration
        break;
    default:
        throw "No SiteContext script parameter passed to the running script";
   }
   //===========================================================================

  //Boolean to detect if script is run in test development enviroment, set by the OnScriptSend event
  var IsTestCase = aEvent.IsTestCase;
  //The inbound HL7 V2 message object
  var oHL7 = aEvent.OutMessage;
  //The programaticaly build HL7 V2 acknowledgment message, effectivly an acknowledgment to our selves
  //to indicate this message successfully was sent to ICIMS or not.
  var oHL7Reply = aEvent.ReplyMessage;
  //Boolean that indicates the the data was collected from the V2 Message with out error and that
  //The script can now proced to attempting to call the ICIMS Rest service
  var CallRESTService = false;
  //Variable to hold the ICIMS payload, sent in a Form data type format
  var FormData = "";
  //Is later set to the method name at the endpoint (Add, Update, Merge)
  var EndPointMethod = "";
  //The current inbound HL7 V2 message type
  var MessageType = oHL7.Segment("MSH",0).Field(9).Component(1).AsString.toUpperCase();
  //The current inbound HL7 V2 message event
  var MessageEvent = oHL7.Segment("MSH",0).Field(9).Component(2).AsString.toUpperCase();
  try
  {
   if (MessageType == "ADT")
   {
     var IcimsInterface= new IcimsInterfaceModels();
     if (MessageEvent == "A04")
     {
       var Add = new Models.Add(oHL7);
       FormData = IcimsInterface.MapToIcimsInterface(Add);
       EndPointMethod = Add.Meta.Action;
       CallRESTService = true;
     }
     else if (MessageEvent == "A08")
     {
       var Update = new Models.Update(oHL7);
       FormData = IcimsInterface.MapToIcimsInterface(Update);
       EndPointMethod = Update.Meta.Action;
       CallRESTService = true;
     }
     else if (MessageEvent == "A40")
     {
       var Merge = new Models.Merge(oHL7);
       FormData = IcimsInterface.MapToIcimsInterface(Merge);
       EndPointMethod = Merge.Meta.Action;
       CallRESTService = true;
     }
     else
     {
       var ErrorMsg = "ICIMS Unknown Message Event of: " + MessageEvent;
	   IcimsLog("ICIMS Unknown Message Event, expect ADT Events A04, A08 & A40, found event: " + MessageEvent);
       RejectMessage(ErrorMsg);
       StopInterface(ErrorMsg, FacilityConfiguration.NameOfInterfaceRunnningScript, IsTestCase);
     }
     //Data Processed now attempt to call ICIMS REST Service
     if (CallRESTService)
     {
       BreakPoint;
       IcimsLog("Logging form data about to be sent to ICIMS:");
       IcimsLog("-------------------------------------------------------------");
       IcimsLog(FormData);


       var Client = new RestClient();
       var POSTOutcome = new Client.POST(FacilityConfiguration.EndPoint, EndPointMethod, FacilityConfiguration.AuthorizationToken, FormData);
       if (!POSTOutcome.Error && POSTOutcome.HttpStatus == 200)
       {
         IcimsLog("Data We got: " + POSTOutcome.DataReceived);
         //Message has been sent successfully to ICIMS, event complete!
       }
       else if(!POSTOutcome.Error && POSTOutcome.HttpStatus == 401)
       {
         //We have a HTTP Status code 400 error, Authorization failed.
         var ICIMSError = ParseICIMSJson(POSTOutcome.DataReceived);
         var ErrorMsg = "ICIMS Error Message: State: " + ICIMSError.state + ", Msg: " + ICIMSError.error;
         IcimsLog("ICIMS HTTP Status Code "+ POSTOutcome.HttpStatus + ": Authorization failed, check Authorization token is correct in script.");
         IcimsLog("ICIMS HTTP Authorization token used: " + FacilityConfiguration.AuthorizationToken);
         IcimsLog(ErrorMsg);
         RejectMessage(ErrorMsg);
         StopInterface(ErrorMsg, FacilityConfiguration.NameOfInterfaceRunnningScript, IsTestCase);
       }
       else if(!POSTOutcome.Error)
       {
         //We have some other HTTP error code
         var ICIMSError = ParseICIMSJson(POSTOutcome.DataReceived);
         var ErrorMsg = "ICIMS HTTP failed HTTP Status: " + POSTOutcome.HttpStatus + ", State: " + ICIMSError.state + ", Msg: " + ICIMSError.error;
         IcimsLog(ErrorMsg);
         IcimsLog("ICIMS HTTP Error Message: " + POSTOutcome.DataReceived);
         IcimsLog(ErrorMsg);
         RejectMessage(ErrorMsg);
         StopInterface(ErrorMsg, FacilityConfiguration.NameOfInterfaceRunnningScript, IsTestCase);
       }
       else
       {
         if (POSTOutcome.Error)
         {
           //We were unable to reach the REST endpoint, maybe network connection is down?
           var ErrorMsg = "ICIMS HTTP Request failed, network connectivity issue";
           IcimsLog(ErrorMsg);
           IcimsLog("ICIMS Error Message: " + POSTOutcome.ErrorMessage);
           RejectMessage(ErrorMsg);
           StopInterface(ErrorMsg, FacilityConfiguration.NameOfInterfaceRunnningScript, IsTestCase);
         }
         else
         {
           //Some unexplained script error, should not happen!
           var ErrorMsg = "ICIMS Unknown Scripting error";
           IcimsLog(ErrorMsg);
           IcimsLog("ICIMS Possible RestClient error.");
           RejectMessage(ErrorMsg);
           StopInterface(ErrorMsg, FacilityConfiguration.NameOfInterfaceRunnningScript, IsTestCase);
         }
       }
     }
   }
   else
   {
     //A HL7 V2 message type that is not suported by this script was passed in.
     var ErrorMsg = "ICIMS expected Message type: " + MessageType;
     IcimsLog("ICIMS Unknown Message type, only expect ADT messages");
     RejectMessage(ErrorMsg);
     StopInterface(ErrorMsg, FacilityConfiguration.NameOfInterfaceRunnningScript, IsTestCase);
   }
  }
  catch(Exec)
  {
   //The script has throwen and exception, should not happen!
   var ErrorMsg = "ICIMS Unknown Scripting exception of :" + Exec;
   IcimsLog(ErrorMsg);
   IcimsLog("ICIMS Error Message: " + Exec);
   RejectMessage(ErrorMsg);
   StopInterface(ErrorMsg, FacilityConfiguration.NameOfInterfaceRunnningScript, IsTestCase);
  }

  /** @function
   * @description Function to stop the interface if 'FacilityConfiguration.MaxRejectBeforeInterfaceStop' Reject Count max reached
   * @param {string} ErrorMsg The Error message to show on the HL7 Connect status page interface
   * @returns {void}
  */
  function StopInterface(ErrorMsg)
  {
    if (IsTestCase == false)
    {

      var oInterfaceOut = Kernel.Getinterface(FacilityConfiguration.NameOfInterfaceRunnningScript);
      var RejectCount = oInterfaceOut.RejCount
      if (RejectCount > FacilityConfiguration.MaxRejectBeforeInterfaceStop - 2)
      {
        IcimsLog("ICIMS Script is stopping the interface due to Reject count max reached.")
        //SendEmail("smtp.iinet.net.au", "HL7 Connect Error", "angusmillar@iinet.net.au", "hl7connect@error.com.au", "There was an error");
        oInterfaceOut.Stop(false, "Script-Error", ErrorMsg);
      }
    }
  }


  /** @function
   * @description Function to set the HL7 V2 acknowledgement message reject error message
   * @param {string} ErrorMsg The Error message to place in the HL7 V2 acknowledgement message
   * @returns {void}
  */
  function RejectMessage(ErrorMsg)
  {
    oHL7Reply.Element("MSA-1").AsString  = "AR";
    oHL7Reply.Element("MSA-3").AsString  = ErrorMsg;
  }

  /** @function
   * @description Validate the Site context string, passed in to the script event, is a valid SiteContectEnum value.
   * @param {string} SiteContext The site context the script is runnig under
   * @returns {enum} SiteContextEnum
  */
  function ValidateSiteContext(SiteContext){
    if (SiteContext.toUpperCase() == SiteContextEnum.RMH)
    {
      return SiteContextEnum.RMH;
    }
    else
    {
      var SiteList = [];
      for(var Site in SiteContextEnum)
      {
         SiteList.push(Site);
      }
      var Sites = SiteList.join(" or ");
      if (aEvent.Parameter == "")
      {
        throw "No SiteContext script parameter passed to the running script. Allowed (" + Sites + ")";
      }
      else
      {
        throw "Unknowen SiteContext parameter of '" + aEvent.Parameter + "' passed to the running script. Allowed (" + Sites + ")";
      }
    }
  }

/** @function
 * @param {string} JsonString A string in JSON format
 * @returns {object}
*/
  function ParseICIMSJson(JsonString){
    //If ICIMCS returns a json object which throws an exception on parsing, then this object is parsed and used.
    var UnableToParseJsonError = '{"state": "Script", "error": "Unable to paser ICIMS JSON error."}';
    var ICIMSData = null;
    if (JsonString !== "")
    {
      try
      {
        return JSON.parse(JsonString);
      }
      catch(Exec)
      {
	    IcimsLog("Unable to paser ICIMS JSON error, raw data was:");
        IcimsLog("-------------------------------------------------------------");
        IcimsLog(JsonString);
        return JSON.parse(UnableToParseJsonError);
      }
    }
	IcimsLog("Unable to paser ICIMS JSON Object as returned object was an empty string.");
    return JSON.parse(UnableToParseJsonError);
  }


/** @function
 * @description Write a message to the custom ICIMS log file.
 * @param {string} Message to log
 * @returns {object}
*/
  function IcimsLog(message){
	var currentdate = new Date();
    var datetime = currentdate.toDateString() + " : "
	+ currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

    Kernel.WriteToCustomLog("IcimsLog", datetime + ": " + message + "\r" + "\n")
  }

}

//======= Global ===============================================================

//enum of the sites configured for this script.
//Add to this list as new sites are brought on board.

/**
 * Enum for Site Context.
 * @readonly
 * @enum {string}
 * @global
*/
var SiteContextEnum = {
  /** RMH */
  RMH : "RMH"
};