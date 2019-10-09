
<% include $repo$\Support\HL7CParameterSupport.js %>
<% include $repo$\PASFhir\FacilityConfig.js %>
<% include $repo$\Logging\Logger.js %>
<% include $repo$\PASFhir\BusinessModel.js %>
<% include $repo$\FhirLibrary\Json\FhirJson.js %>
<% include $repo$\FhirLibrary\Client\FhirClient.js %>
<% include $repo$\PASFhir\FhirResourceFactory.js %>
<% include $repo$\PASFhir\FacilityFhirConfig.js %>

  function Main(aEvent) {
    //Validate and set the site context for the script
    //This is so the script can be adjusted for new sites as required.
    //For instance the string "SAH" must be passed in as a script parameter from HL7 Connect.
    BreakPoint;
    var IsTestCase = aEvent.IsTestCase;
    var oLogger = new Logger();
    oLogger.SetCustomLogName(_CustomLogNameType.PASFhir);
    var oHL7CParameterSupport = new HL7CParameterSupport(oLogger, aEvent.Parameter);
    var oFacilityConfig = new FacilityConfig();
    oFacilityConfig.Fhir = new FacilityFhirConfig();
    try {
      oFacilityConfig.SetSiteContext(oHL7CParameterSupport.SiteCode);
    } catch (Exec) {
      oLogger.Log("Unable to set Site Context :" + Exec);
    }

    //=========== Per site Configuration ========================================
    var FacilityConfiguration = null;
    switch (oFacilityConfig.SiteContext) {
      case oFacilityConfig.SiteContextEnum.TST:

        oFacilityConfig.PrimaryMRNAssigningAuthority = "TST";

        oFacilityConfig.PrimaryMRNSystemUri = "https://www.test.org.au/systems/fhir/pas/medical-record-number";
        //Send the Pathology Pdf report if provided in V2 message
        oFacilityConfig.SendPathologyPdfReport = false;
        //NameOfInterfaceRunnningScript - The name of the HL7 Connect interface this script is triggered from
        oFacilityConfig.NameOfInterfaceRunnningScript = "IcimsPathologyOutbound";
        //MaxRejectBeforeInterfaceStop  - The number of Reject counts before the interface will stop, these are the red errors on the HL7Connect status page
        oFacilityConfig.MaxRejectBeforeInterfaceStop = 20;

        //Enviroment Switch
        switch (oHL7CParameterSupport.Enviroment) {
          case oHL7CParameterSupport.EnviromentCodes.DEV:
            oFacilityConfig.Fhir.FhirEndpoint = "https://r4.test.pyrohealth.net/fhir";
            oFacilityConfig.Fhir.OperationName = "Bundle"
            oFacilityConfig.Fhir.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
            break;

          case oHL7CParameterSupport.EnviromentCodes.TEST:
            oFacilityConfig.Fhir.FhirEndpoint = "https://r4.test.pyrohealth.net/fhir";
            oFacilityConfig.Fhir.OperationName = "Bundle"
            oFacilityConfig.Fhir.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
            break;

          case oHL7CParameterSupport.EnviromentCodes.PROD:
            oFacilityConfig.Fhir.FhirEndpoint = "https://r4.test.pyrohealth.net/fhir";
            oFacilityConfig.Fhir.OperationName = "Bundle"
            oFacilityConfig.Fhir.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
            break;
        }

        oFacilityConfig.Fhir.EncounterNumberSystemUri = "https://www.testing.org.au/systems/fhir/encounter-number";
        oFacilityConfig.Fhir.HL7V2MessageControlIdSystemUri = "https://www.testing.org.au/systems/fhir/hl7-v2/message-control-id";
        //Codes from DG1-3
        oFacilityConfig.Fhir.ConditionCodeSystemUri = "https://www.testing.org.au/systems/fhir/Condition";

        //Codes from AL1-3
        oFacilityConfig.Fhir.AllergyIntoleranceCodeSystemUri = "https://www.testing.org.au/systems/fhir/AllergyIntolerance";

        oFacilityConfig.Fhir.ReceivingOrganizationName = "AcmeHealth";
        oFacilityConfig.Fhir.ReceivingOrganizationResourceId = "8388a9b2-9acc-4a04-afc7-ceaac91f611a";

        oFacilityConfig.Fhir.SendingOrganizationName = "TestingHealth";
        oFacilityConfig.Fhir.SendingOrganizationResourceId = "52ce2a70-aa42-4732-b4f1-22dbd53fbffc";

        break;
      default:
        throw "No SiteContext script parameter passed to the running script";
    }
    //===========================================================================

    //The inbound HL7 V2 message object
    var oHL7 = aEvent.OutMessage;
    //Boolean that indicates the the data was collected from the V2 Message with out error and that
    //The script can now proced to attempting to call the ICIMS Rest service
    var CallRESTService = false;

    var oModel = new BusinessModel();
    oModel.Logger = oLogger;
    oModel.FacilityConfig = oFacilityConfig;

    try {

      if (oModel.CanProcessADTMessage(oHL7)) {

        oModel.ProcessADTMessage(oHL7);
        var FhirResFactory = new FhirResourceFactory();
        var Bundle = new FhirResFactory.CreateADTBundle(oModel);

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
      } else {
        var ErrorMsg = "Unexpected Message Type or Event of: " + MessageType + "^" + MessageEvent;
        oLogger.Log(ErrorMsg);
        RejectMessage(ErrorMsg);
        StopInterface(ErrorMsg, IsTestCase);
      }


      //Data Processed now attempt to call  REST Service
      if (CallRESTService) {
        BreakPoint;
        oLogger.Log("Logging request body data about to be sent:");
        oLogger.Log("-------------------------------------------------------------");
        oLogger.Log(BodyData);

        var Client = new FhirClient();
        var POSTOutcome = new Client.POST(oModel.FacilityConfig.Fhir.FhirEndpoint, oModel.FacilityConfig.Fhir.OperationName, oModel.FacilityConfig.Fhir.AuthorizationToken, BodyData);
        if (!POSTOutcome.Error && POSTOutcome.HttpStatus == 200) {
          oLogger.Log("Data received: " + POSTOutcome.DataReceived);
          //Message has been sent successfully, event complete!
        } else if (!POSTOutcome.Error && POSTOutcome.HttpStatus == 401) {
          //We have a HTTP Status code 401 error, Authorization failed.
          var ICIMSError = ParseICIMSJson(POSTOutcome.DataReceived);
          var ErrorMsg = "ICIMS Error Message: State: " + ICIMSError.state + ", Msg: " + ICIMSError.error;
          oLogger.Log("ICIMS HTTP Status Code " + POSTOutcome.HttpStatus + ": Authorization failed, check Authorization token is correct in script.");
          oLogger.Log("ICIMS HTTP Authorization token used: " + oModel.FacilityConfig.Fhir.AuthorizationToken);
          oLogger.Log(ErrorMsg);
          RejectMessage(ErrorMsg);
          StopInterface(ErrorMsg, IsTestCase);
        } else if (!POSTOutcome.Error) {
          //We have some other HTTP error code
          var ICIMSError = ParseICIMSJson(POSTOutcome.DataReceived);
          var ErrorMsg = "ICIMS HTTP failed HTTP Status: " + POSTOutcome.HttpStatus + ", State: " + ICIMSError.state + ", Msg: " + ICIMSError.error;
          oLogger.Log(ErrorMsg);
          oLogger.Log("ICIMS HTTP Error Message: " + POSTOutcome.DataReceived);
          oLogger.Log(ErrorMsg);
          RejectMessage(ErrorMsg);
          StopInterface(ErrorMsg, IsTestCase);
        } else {
          if (POSTOutcome.Error) {
            //We were unable to reach the REST endpoint, maybe network connection is down?
            var ErrorMsg = "HTTP Request failed, network connectivity issue";
            oLogger.Log(ErrorMsg);
            oLogger.Log("Error Message: " + POSTOutcome.ErrorMessage);
            RejectMessage(ErrorMsg);
            StopInterface(ErrorMsg, IsTestCase);
          } else {
            //Some unexplained script error, should not happen!
            var ErrorMsg = "Unknown Scripting error";
            oLogger.Log(ErrorMsg);
            oLogger.Log("Possible RestClient error.");
            RejectMessage(ErrorMsg);
            StopInterface(ErrorMsg, IsTestCase);
          }
        }
      }
    }
    catch (Exec) {
      //The script has throwen and exception, should not happen!
      var ErrorMsg = "Unknown Scripting exception of :" + Exec;
      oLogger.Log(ErrorMsg);
      oLogger.Log("Error Message: " + Exec);
      RejectMessage(ErrorMsg);
      StopInterface(ErrorMsg, IsTestCase);
    }

    //Function to stop the interface if 'oModel.FacilityConfig.MaxRejectBeforeInterfaceStop' Reject Count max reached    
    function StopInterface(ErrorMsg, IsTestCase) {
      if (IsTestCase == false) {
        var oInterfaceOut = Kernel.Getinterface(oModel.FacilityConfig.NameOfInterfaceRunnningScript);
        var RejectCount = oInterfaceOut.RejCount
        if (RejectCount > oModel.FacilityConfig.MaxRejectBeforeInterfaceStop - 2) {
          oLogger.Log("Script is stopping the interface due to Reject count max reached.")
          //SendEmail("smtp.iinet.net.au", "HL7 Connect Error", "angusmillar@iinet.net.au", "hl7connect@error.com.au", "There was an error");
          oInterfaceOut.Stop(false, "Script-Error", ErrorMsg);
        }
      }
    }


    ///Function to set the HL7 V2 acknowledgement message reject error message     
    function RejectMessage(ErrorMsg) {
      var oHL7Reply = aEvent.ReplyMessage;
      oHL7Reply.Element("MSA-1").AsString = "AR";
      oHL7Reply.Element("MSA-3").AsString = ErrorMsg;
    }


    //Parse the JSON returned by ICIMS.
    function ParseICIMSJson(JsonString) {
      //If ICIMCS returns a json object which throws an exception on parsing, then this object is parsed and used.
      var UnableToParseJsonError = '{"state": "Script", "error": "Unable to paser ICIMS JSON error."}';
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