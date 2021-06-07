<% include $newserver$\Logging\Logger.js %>
<% include $newserver$\Support\HL7CParameterSupport.js %>
<% include $newserver$\ICIMS\BusinessModels.js %>
<% include $newserver$\ICIMS\IcimsInterfaceModels.js %>
<% include $newserver$\ICIMS\RestClient.js %>
<% include $newserver$\FhirLibrary\Json\FhirJson.js %>

  // The IcimsRunner script is the entry point for HL7 Connect.
  // This script is to be referanced on a HL7 Connect outgoing scripted interface with the procedure name
  //'<code>IcimsRunner</code>' and a single parameter equal to one of the 'SiteContextEnum' values <code>'RMH'</code> for example.

  //The main entry point for HL7 Connect on fireing the OnScriptSend event.   
  function IcimsRunner(aEvent) {

    BreakPoint;
    var oLogger = new Logger();
    oLogger.SetCustomLogName(_CustomLogNameType.Icims);
    var oHL7CParameterSupport = new HL7CParameterSupport(oLogger, aEvent.Parameter);

    //Validate and set the site context for the script
    //This is so the script can be adjusted for new sites as required.
    //For instance the string "RMH" must be passed in as a script parameter from HL7 Connect.
    var SiteContext = ValidateSiteContext(oHL7CParameterSupport.SiteCode);

    var oModels = new BusinessModels(SiteContext);
    //=========== Per site Configuration ========================================
    var FacilityConfiguration = null;
    switch (SiteContext) {
      case SiteContextEnum.RMH:
        //The Site Context enum we are running the script under
        FacilityConfiguration = oModels.FacilityConfiguration(SiteContext);
        FacilityConfiguration.Implementation = oHL7CParameterSupport.Implementation;
        //Environment Switch
        switch (oHL7CParameterSupport.Environment) {
          case EnvironmentTypeEnum.DEV:
            FacilityConfiguration.EndPoint = "http://localhost:60823/api/mock";
            FacilityConfiguration.AuthorizationToken = "Basic NotRequired";
            FacilityConfiguration.NameOfInterfaceRunningScript = "IcimsScriptOutbound";
            break;

          case EnvironmentTypeEnum.TEST:
            FacilityConfiguration.EndPoint = "http://icimsdev01.sah.com/staging/api/pas_sah.py"
            FacilityConfiguration.AuthorizationToken = "Basic aGw3dGVzdDppY2ltczIwMTc=";
            FacilityConfiguration.NameOfInterfaceRunningScript = "IcimsScriptOutbound";
            break;

          case EnvironmentTypeEnum.PROD:
            FacilityConfiguration.EndPoint = "http://icimsprod01.sah.com/staging/api/pas_sah.py"
            FacilityConfiguration.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
            FacilityConfiguration.NameOfInterfaceRunningScript = "IcimsScriptOutbound";

            break;
        }
        //PrimaryMRNAssigningAuthority - This is used for Patient Merges and to colllect the single MRN wiht this AssigningAuthority code
        FacilityConfiguration.PrimaryMRNAssigningAuthority = "RMH";
        //MaxRejectBeforeInterfaceStop  - The number of Reject counts before the interface will stop, these are the red errors on the HL7Connect status page
        FacilityConfiguration.MaxRejectBeforeInterfaceStop = 20;
        oModels.FacilityConfig = FacilityConfiguration
        break;
      case SiteContextEnum.SAH:
        //The Site Context enum we are running the script under
        FacilityConfiguration = oModels.FacilityConfiguration(SiteContext);
        //Environment Switch
        switch (oHL7CParameterSupport.Environment) {
          case EnvironmentTypeEnum.DEV:
            if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.CLINISEARCHADT) {
              FacilityConfiguration.EndPoint = "http://localhost:60823/api/mock";
              FacilityConfiguration.AuthorizationToken = "Basic NotRequired";
              FacilityConfiguration.NameOfInterfaceRunningScript = "IcimsScriptOutbound";
            } else if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.ICIMSADT) {
              FacilityConfiguration.EndPoint = "http://localhost:60823/api/mock";
              FacilityConfiguration.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
              FacilityConfiguration.NameOfInterfaceRunningScript = "IcimsScriptOutbound";
            }
            break;

          case EnvironmentTypeEnum.TEST:
            if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.CLINISEARCHADT) {
              FacilityConfiguration.EndPoint = "http://icimsdev01.sah.com:9001/adt"
              FacilityConfiguration.AuthorizationToken = "";
              FacilityConfiguration.NameOfInterfaceRunningScript = "ADT-CliniSearch-Test";
            } else if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.ICIMSADT) {
              FacilityConfiguration.EndPoint = "http://icimsdev01.sah.com/staging/api/pas_sah.py"
              FacilityConfiguration.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
              FacilityConfiguration.NameOfInterfaceRunningScript = "IcimsScriptOutbound";
            }
            break;

          case EnvironmentTypeEnum.PROD:
            if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.CLINISEARCHADT) {
              FacilityConfiguration.EndPoint = "http://CliniSearch.sah.com:9001/adt"
              FacilityConfiguration.AuthorizationToken = "";
              FacilityConfiguration.NameOfInterfaceRunningScript = "ADT-CliniSearch-Prod";
            } else if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.ICIMSADT) {
              FacilityConfiguration.EndPoint = "http://icimsprod01.sah.com/staging/api/pas_sah.py"
              FacilityConfiguration.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
              FacilityConfiguration.NameOfInterfaceRunningScript = "IcimsScriptOutbound";
            }
            break;
        }

        //PrimaryMRNAssigningAuthority - This is used for Patient Merges and to colllect the single MRN wiht this AssigningAuthority code
        FacilityConfiguration.PrimaryMRNAssigningAuthority = "SAH";
        //MaxRejectBeforeInterfaceStop  - The number of Reject counts before the interface will stop, these are the red errors on the HL7Connect status page
        FacilityConfiguration.MaxRejectBeforeInterfaceStop = 20;
        break;
      default:
        throw new Error("No SiteContext script parameter passed to the running script");
    }
    //===========================================================================

    //Boolean to detect if script is run in test development Environment, set by the OnScriptSend event
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
    var MessageType = oHL7.Segment("MSH", 0).Field(9).Component(1).AsString.toUpperCase();
    //The current inbound HL7 V2 message event
    var MessageEvent = oHL7.Segment("MSH", 0).Field(9).Component(2).AsString.toUpperCase();
    try {
      if (MessageType == "ADT") {
        var IcimsInterface = new IcimsInterfaceModels();
        if (MessageEvent == "A04" || MessageEvent == "A05")    //Register a patient
        {
          oModels.AddMessage(oHL7);
          FormData = IcimsInterface.MapToIcimsInterface(oModels);
          EndPointMethod = oModels.Action;
          CallRESTService = true;
        }
        else if (MessageEvent == "A01" || MessageEvent == "A08" || MessageEvent == "A02" || MessageEvent == "A03")  //Update patient information
        {
          oModels.UpdateMessage(oHL7);
          FormData = IcimsInterface.MapToIcimsInterface(oModels);
          EndPointMethod = oModels.Action;
          CallRESTService = true;
        }
        else if (MessageEvent == "A40")  //Merge patient - internal ID
        {
          //var Merge = new oModels.MergeA40Message(oHL7);
          oModels.MergeMessage(oHL7);
          FormData = IcimsInterface.MapToIcimsInterface(oModels);
          Breakpoint;
          EndPointMethod = oModels.Action;
          CallRESTService = true;
        }
        else {
          var ErrorMsg = "ICIMS Unknown Message Event of: " + MessageEvent;
          oLogger.Log("ICIMS Unknown Message Event, expect ADT Events A04, A08 & A40, found event: " + MessageEvent);
          RejectMessage(ErrorMsg);
          StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
        }
        //Data Processed now attempt to call ICIMS REST Service
        if (CallRESTService) {
          BreakPoint;
          oLogger.Log("Logging form data about to be sent to ICIMS:");
          oLogger.Log("-------------------------------------------------------------");
          oLogger.Log(FormData);


          var Client = new RestClient();
          var POSTOutcome = new Client.POST(FacilityConfiguration.EndPoint, EndPointMethod, FacilityConfiguration.AuthorizationToken, FormData);
          if (!POSTOutcome.Error && POSTOutcome.HttpStatus == 200) {
            oLogger.Log("Data We got: " + POSTOutcome.DataReceived);
            //Message has been sent successfully to ICIMS, event complete!
          }
          else if (!POSTOutcome.Error && POSTOutcome.HttpStatus == 401) {
            //We have a HTTP Status code 400 error, Authorization failed.
            var ICIMSError = ParseICIMSJson(POSTOutcome.DataReceived, oLogger);
            var ErrorMsg = "ICIMS Error Message: State: " + ICIMSError.state + ", Msg: " + ICIMSError.error;
            oLogger.Log("ICIMS HTTP Status Code " + POSTOutcome.HttpStatus + ": Authorization failed, check Authorization token is correct in script.");
            oLogger.Log("ICIMS HTTP Authorization token used: " + FacilityConfiguration.AuthorizationToken);
            oLogger.Log(ErrorMsg);
            RejectMessage(ErrorMsg);
            StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
          }
          else if (!POSTOutcome.Error) {
            //We have some other HTTP error code
            var ICIMSError = ParseICIMSJson(POSTOutcome.DataReceived, oLogger);
            var ErrorMsg = "ICIMS HTTP failed HTTP Status: " + POSTOutcome.HttpStatus + ", State: " + ICIMSError.state + ", Msg: " + ICIMSError.error;
            oLogger.Log(ErrorMsg);
            oLogger.Log("ICIMS HTTP Error Message: " + POSTOutcome.DataReceived);
            oLogger.Log(ErrorMsg);
            RejectMessage(ErrorMsg);
            StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
          }
          else {
            if (POSTOutcome.Error) {
              //We were unable to reach the REST endpoint, maybe network connection is down?
              var ErrorMsg = "ICIMS HTTP Request failed, network connectivity issue";
              oLogger.Log(ErrorMsg);
              oLogger.Log("ICIMS Error Message: " + POSTOutcome.ErrorMessage);
              RejectMessage(ErrorMsg);
              StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
            }
            else {
              //Some unexplained script error, should not happen!
              var ErrorMsg = "ICIMS Unknown Scripting error";
              oLogger.Log(ErrorMsg);
              oLogger.Log("ICIMS Possible RestClient error.");
              RejectMessage(ErrorMsg);
              StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
            }
          }
        }
      }
      else {
        //A HL7 V2 message type that is not suported by this script was passed in.
        var ErrorMsg = "ICIMS expected Message type: " + MessageType;
        oLogger.Log("ICIMS Unknown Message type, only expect ADT messages");
        RejectMessage(ErrorMsg);
        StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
      }
    }
    catch (Exec) {
      //The script has throwen and exception, should not happen!
      var ErrorMsg = "ICIMS Unknown Scripting exception of :" + Exec.message;
      oLogger.Log(ErrorMsg);
      oLogger.Log("ICIMS Error Message: " + Exec.message);
      RejectMessage(ErrorMsg);
      StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
    }

    //Function to stop the interface if 'FacilityConfiguration.MaxRejectBeforeInterfaceStop' Reject Count max reached    
    function StopInterface(ErrorMsg, oLogger, oFacilityConfig, IsTestCase) {
      if (IsTestCase == false) {
        var oInterfaceOut = Kernel.Getinterface(oFacilityConfig.NameOfInterfaceRunningScript);
        var RejectCount = oInterfaceOut.RejCount
        if (RejectCount > oFacilityConfig.MaxRejectBeforeInterfaceStop - 2) {
          oLogger.Log("ICIMS Script is stopping the interface due to Reject count max reached.")
          oInterfaceOut.Stop(false, "Script-Error", ErrorMsg);
        }
      }
    }

    //Function to set the HL7 V2 acknowledgement message reject error message
    // ErrorMsg The Error message to place in the HL7 V2 acknowledgement message    
    function RejectMessage(ErrorMsg) {
      oHL7Reply.Element("MSA-1").AsString = "AR";
      oHL7Reply.Element("MSA-3").AsString = ErrorMsg;
    }

    //Validate the Site context string, passed in to the script event, is a valid SiteContectEnum value.
    //SiteContext The site context the script is runnig under
    //SiteContextEnum
    function ValidateSiteContext(SiteContext) {
      if (SiteContext.toUpperCase() == SiteContextEnum.RMH) {
        return SiteContextEnum.RMH;
      }
      else if (SiteContext.toUpperCase() == SiteContextEnum.SAH) {
        return SiteContextEnum.SAH;
      }
      else {
        var SiteList = [];
        for (var Site in SiteContextEnum) {
          SiteList.push(Site);
        }
        var Sites = SiteList.join(" or ");
        if (aEvent.Parameter == "") {
          throw new Error("No SiteContext script parameter passed to the running script. Allowed (" + Sites + ")");
        }
        else {
          throw new Error("Unknowen SiteContext parameter of '" + aEvent.Parameter + "' passed to the running script. Allowed (" + Sites + ")");
        }
      }
    }

    //JsonString A string in JSON format    
    function ParseICIMSJson(JsonString, oLogger) {
      //If ICIMCS returns a json object which throws an exception on parsing, then this object is parsed and used.
      var UnableToParseJsonError = '{"state": "Script", "error": "Unable to paser ICIMS JSON error."}';
      var ICIMSData = null;
      if (JsonString !== "") {
        try {
          return JSON.parse(JsonString);
        }
        catch (Exec) {
          oLogger.Log("Unable to paser ICIMS JSON error, raw data was:");
          oLogger.Log("-------------------------------------------------------------");
          oLogger.Log(JsonString);
          return JSON.parse(UnableToParseJsonError);
        }
      }
      oLogger.Log("Unable to paser ICIMS JSON Object as returned object was an empty string.");
      return JSON.parse(UnableToParseJsonError);
    }
  }

