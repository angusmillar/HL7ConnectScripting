
<% include $newserver$\Logging\Logger.js %>
<% include $newserver$\Support\HL7CParameterSupport.js %>
<% include $newserver$\ICIMS\BusinessModels.js %>
<% include $newserver$\FhirLibrary\Json\FhirJson.js %>
<% include $newserver$\FhirLibrary\Client\FhirClient.js %>
<% include $newserver$\ICIMS\FhirResourceFactory.js %>

  function Main(aEvent) {
    //Validate and set the site context for the script
    //This is so the script can be adjusted for new sites as required.
    //For instance the string "SAH" must be passed in as a script parameter from HL7 Connect.
    BreakPoint;
    var oLogger = new Logger();
    oLogger.SetCustomLogName(_CustomLogNameType.IcimsPathology);

    //The inbound HL7 V2 message object
    var oHL7 = aEvent.OutMessage;

    //Used for custom routing for Cliniseach server move
    var ReceivingFacility = oHL7.Segment("MSH", 0).Field(5).Component(1).AsString;

    var oHL7CParameterSupport = new HL7CParameterSupport(oLogger, aEvent.Parameter, ReceivingFacility);
    var SiteContext = ValidateSiteContext(oHL7CParameterSupport.SiteCode);

    var oModels = new BusinessModels(SiteContext);
    //=========== Per site Configuration ========================================
    var FacilityConfiguration = null;
    switch (SiteContext) {
      case SiteContextEnum.SAH:
        //The Site Context enum we are running the script under
        FacilityConfiguration = oModels.FacilityConfiguration(SiteContext);
        FacilityConfiguration.Implementation = oHL7CParameterSupport.Implementation;
        //Environment Switch
        switch (oHL7CParameterSupport.Environment) {
          case EnvironmentTypeEnum.DEV:
            if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
              FacilityConfiguration.EndPoint = "https://stu3.test.pyrohealth.net/fhir";
              FacilityConfiguration.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
              FacilityConfiguration.NameOfInterfaceRunningScript = "Pathology-CliniSearch-Prod";
            } else if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
              FacilityConfiguration.EndPoint = "https://stu3.test.pyrohealth.net/fhir";
              FacilityConfiguration.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
              FacilityConfiguration.NameOfInterfaceRunningScript = "Radiology-CliniSearch-Prod";
            } else {
              FacilityConfiguration.EndPoint = "https://stu3.test.pyrohealth.net/fhir";
              FacilityConfiguration.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
              FacilityConfiguration.NameOfInterfaceRunningScript = "Icims-ClinicalReports-Outbound";
            }
            FacilityConfiguration.OperationName = "Bundle";
            break;

          case EnvironmentTypeEnum.TEST:
            if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
              FacilityConfiguration.EndPoint = "http://icimsdev01.sah.com:9000/fhir";
              FacilityConfiguration.AuthorizationToken = ""; //Not required
              FacilityConfiguration.NameOfInterfaceRunningScript = "Reports-CliniSearch-Test";
            } else if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
              FacilityConfiguration.EndPoint = "http://icimsdev01.sah.com:9000/fhir";
              FacilityConfiguration.AuthorizationToken = ""; //Not required
              FacilityConfiguration.NameOfInterfaceRunningScript = "Reports-CliniSearch-Test";
            } else {
              FacilityConfiguration.EndPoint = "http://localhost:5000/fhir";
              FacilityConfiguration.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
              FacilityConfiguration.NameOfInterfaceRunningScript = "IcimsReportsScriptOutbound";
            }
            FacilityConfiguration.OperationName = "$process-message";
            break;

          case EnvironmentTypeEnum.PROD:
            if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.CLINISEARCHPATHOLOGY) {
              FacilityConfiguration.EndPoint = "http://clinisearchprod.sah.com:9000/fhir";
              FacilityConfiguration.AuthorizationToken = ""; //Not required
              FacilityConfiguration.NameOfInterfaceRunningScript = "Pathology-CliniSearch-Prod";
            } else if (oHL7CParameterSupport.Implementation == ImplementationTypeEnum.CLINISEARCHRADIOLOGY) {
              FacilityConfiguration.EndPoint = "http://clinisearchprod.sah.com:9000/fhir";
              FacilityConfiguration.AuthorizationToken = ""; //Not required
              FacilityConfiguration.NameOfInterfaceRunningScript = "Radiology-CliniSearch-Prod";
            } else {
              FacilityConfiguration.EndPoint = "http://localhost:5000/fhir";
              FacilityConfiguration.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
              FacilityConfiguration.NameOfInterfaceRunningScript = "Icims-ClinicalReports-Outbound";
            }
            FacilityConfiguration.OperationName = "$process-message";
            break;
        }

        //PrimaryMRNAssigningAuthority - This is used for Patient Merges and to collect the single MRN with this AssigningAuthority code
        FacilityConfiguration.PrimaryMRNAssigningAuthority = "SAH";
        //EndPoint - The REST endpoint url for ICIMS
        FacilityConfiguration.PrimaryMRNSystemUri = "https://www.sah.org.au/systems/fhir/pas/medical-record-number";
        //Send the Pathology Pdf report if provided in V2 message
        FacilityConfiguration.SendPathologyPdfReport = false;
        //MaxRejectBeforeInterfaceStop  - The number of Reject counts before the interface will stop, these are the red errors on the HL7Connect status page
        FacilityConfiguration.MaxRejectBeforeInterfaceStop = 20;
        break;
      default:
        throw new Error("No SiteContext script parameter passed to the running script");
    }
    //===========================================================================

    //Boolean to detect if script is run in test development Environment, set by the OnScriptSend event
    var IsTestCase = aEvent.IsTestCase;
    //The programaticaly build HL7 V2 acknowledgement message, effectively an acknowledgement to our selves
    //to indicate this message successfully was sent to ICIMS or not.
    var oHL7Reply = aEvent.ReplyMessage;
    //Boolean that indicates the the data was collected from the V2 Message with out error and that
    //The script can now proceed to attempting to call the ICIMS Rest service
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
      if (MessageType == "ORU") {
        if (MessageEvent == "R01") {
          BreakPoint;
          oModels.DiagnosticReportOruMessage(oHL7);

          BreakPoint;
          var FhirResFactory = new FhirResourceFactory();
          var Bundle = new FhirResFactory.CreateDiagnosticReportBundle(oModels);

          BreakPoint;
          var BodyData = JSON.stringify(Bundle, null, 4);
          BreakPoint;

          if (IsTestCase) {
            var fso = new ActiveXObject("Scripting.FileSystemObject");
            var fh = fso.CreateTextFile("C:\\temp\\HL7Connect\\Logging\\Output.json", true);
            fh.Write(BodyData);
            fh.Close();
          }

          CallRESTService = true;
        }
        else {
          var ErrorMsg = "ICIMS Unknown Message Event of: " + MessageEvent;

          oLogger.Log("ICIMS unknown Message Event, expect the events 'R01', found event: " + MessageEvent);
          RejectMessage(ErrorMsg);
          StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
        }
        //Data Processed now attempt to call ICIMS REST Service
        if (CallRESTService) {
          BreakPoint;
          oLogger.Log("Logging request body data about to be sent to ICIMS:");
          oLogger.Log("-------------------------------------------------------------");
          oLogger.Log(BodyData);

          var Client = new FhirClient();
          var POSTOutcome = new Client.POST(FacilityConfiguration.EndPoint, FacilityConfiguration.OperationName, FacilityConfiguration.AuthorizationToken, BodyData);
          if (!POSTOutcome.Error && POSTOutcome.HttpStatus == 200) {
            oLogger.Log("Data received: " + POSTOutcome.DataReceived);
            //Message has been sent successfully to ICIMS, event complete!
          }
          else if (!POSTOutcome.Error && POSTOutcome.HttpStatus == 401) {
            //We have a HTTP Status code 401 error, Authorization failed.
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
            } else {
              //Some unexplained script error, should not happen!
              var ErrorMsg = "ICIMS Unknown Scripting error";
              oLogger.Log(ErrorMsg);
              oLogger.Log("ICIMS Possible RestClient error.");
              RejectMessage(ErrorMsg);
              StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
            }
          }
        }
      } else {
        //A HL7 V2 message type that is not supported by this script was passed in.
        var ErrorMsg = "ICIMS expected Message type: " + MessageType;
        oLogger.Log("ICIMS Unknown Message type, only expect ORU messages");
        RejectMessage(ErrorMsg);
        StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
      }
    }
    catch (Exec) {
      //The script has thrown and exception, should not happen!
      var ErrorMsg = "ICIMS Unknown Scripting exception of :" + Exec.message;
      oLogger.Log(ErrorMsg);
      oLogger.Log("ICIMS Error Message: " + Exec.message);
      RejectMessage(ErrorMsg);
      StopInterface(ErrorMsg, oLogger, oModels.FacilityConfig, IsTestCase);
    }

    /** @function
     * @description Function to stop the interface if 'FacilityConfiguration.MaxRejectBeforeInterfaceStop' Reject Count max reached
     * @param {string} ErrorMsg The Error message to show on the HL7 Connect status page interface
     * @returns {void}
    */
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

    // Function to set the HL7 V2 acknowledgement message reject error message
    // ErrorMsg The Error message to place in the HL7 V2 acknowledgement message     
    function RejectMessage(ErrorMsg) {
      oHL7Reply.Element("MSA-1").AsString = "AR";
      oHL7Reply.Element("MSA-3").AsString = ErrorMsg;
    }


    // Validate the Site context string, passed in to the script event, is a valid SiteContectEnum value.
    // SiteContext The site context the script is runnig under
    // SiteContextEnum
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

    // JsonString A string in JSON format    
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


//======= Global ===============================================================

//enum of the sites configured for this script.
//Add to this list as new sites are brought on board.
// var SiteContextEnum = {
//   SAH: "SAH",
//   RMH: "RMH"
// };

//enum for Implementation
// var ImplementationTypeEnum = {
//   None: "NONE",
//   CLINISEARCHPATHOLOGY: "CLINISEARCHPATHOLOGY",
//   CLINISEARCHRADIOLOGY: "CLINISEARCHRADIOLOGY",
//   Theater: "THEATER",
//   CareZone: "CAREZONE"
// };

//enum for Environment
// var EnvironmentTypeEnum = {
//   DEV: "DEV",
//   TEST: "TEST",
//   PROD: "PROD"
// };
