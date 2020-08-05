
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

    var IsTestCase = aEvent.IsTestCase;
    var oLogger = new Logger();
    oLogger.SetCustomLogName(_CustomLogNameType.PASFhir);
    var oHL7CParameterSupport = new HL7CParameterSupport(oLogger, aEvent.Parameter);
    var oFacilityConfig = new FacilityConfig();
    oFacilityConfig.Fhir = new FacilityFhirConfig();
    try {
      oFacilityConfig.SetSiteContext(oHL7CParameterSupport.SiteCode);
    } catch (Exec) {
      oLogger.Log("Unable to set Site Context :" + Exec.message);
    }

    //=========== Per site Configuration ========================================
    var FacilityConfiguration = null;
    switch (oFacilityConfig.SiteContext) {
      case oFacilityConfig.SiteContextEnum.TST:

        oFacilityConfig.PrimaryMRNAssigningAuthority = "TST";

        oFacilityConfig.PrimaryMRNSystemUri = "https://www.test.org.au/systems/fhir/pas/medical-record-number";
        //Send the Pathology Pdf report if provided in V2 message
        oFacilityConfig.SendPathologyPdfReport = false;
        //MaxRejectBeforeInterfaceStop  - The number of Reject counts before the interface will stop, these are the red errors on the HL7Connect status page
        oFacilityConfig.MaxRejectBeforeInterfaceStop = 2;

        //Environment Switch
        switch (oHL7CParameterSupport.Environment) {
          case EnvironmentTypeEnum.DEV:
            oFacilityConfig.NameOfInterfaceRunningScript = "PASFhir";
            oFacilityConfig.Fhir.FhirEndpoint = "http://localhost:8888/fhir";
            oFacilityConfig.Fhir.OperationNameProcessMessage = "$process-message"
            oFacilityConfig.Fhir.OperationNameMergePatient = "$merge-patient"
            oFacilityConfig.Fhir.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
            break;

          case EnvironmentTypeEnum.TEST:
            oFacilityConfig.NameOfInterfaceRunningScript = "PASFhir";
            oFacilityConfig.Fhir.FhirEndpoint = "https://r4.test.pyrohealth.net/fhir";
            oFacilityConfig.Fhir.OperationNameProcessMessage = "$process-message"
            oFacilityConfig.Fhir.OperationNameMergePatient = "$merge-patient"
            oFacilityConfig.Fhir.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
            break;

          case EnvironmentTypeEnum.PROD:
            oFacilityConfig.NameOfInterfaceRunningScript = "PASFhir";
            oFacilityConfig.Fhir.FhirEndpoint = "https://r4.test.pyrohealth.net/fhir";
            oFacilityConfig.Fhir.OperationNameProcessMessage = "$process-message"
            oFacilityConfig.Fhir.OperationNameMergePatient = "$merge-patient"
            oFacilityConfig.Fhir.AuthorizationToken = "Basic aGw3OmlDSU1TMjBsNw==";
            break;
        }

        oFacilityConfig.Fhir.EncounterNumberSystemUri = "https://www.testing.org.au/systems/fhir/encounter-number";
        oFacilityConfig.Fhir.HL7V2MessageControlIdSystemUri = "https://www.testing.org.au/systems/fhir/hl7-v2/message-control-id";
        //Codes from DG1-3
        oFacilityConfig.Fhir.ConditionCodeSystemUri = "https://www.testing.org.au/systems/fhir/Condition";

        //Codes from AL1-3
        oFacilityConfig.Fhir.AllergyIntoleranceCodeSystemUri = "https://www.testing.org.au/systems/fhir/AllergyIntolerance";

        //true/false: Send the Organization Resources in the Bundle. 
        //Set to true once on setup and then turn off otherwise every message will update the Organization resource in the server, not desired!
        oFacilityConfig.Fhir.SendOrganizationResourceInBundle = true;

        oFacilityConfig.Fhir.ReceivingOrganizationName = "Acme Health";
        oFacilityConfig.Fhir.ReceivingOrganizationResourceId = "AcmeHealth";

        oFacilityConfig.Fhir.SendingOrganizationName = "Testing Health";
        oFacilityConfig.Fhir.SendingOrganizationResourceId = "TestingHealth";

        break;
      default:
        throw new Error("No SiteContext script parameter passed to the running script");
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
      BreakPoint;
      var oIsProcessable = oModel.CanProcessADTMessage(oHL7);
      if (oIsProcessable.ok) {
        oModel.ProcessADTMessage(oHL7);
        var FhirResFactory = new FhirResourceFactory(oModel);
        var BodyData = null;
        if (oModel.IsPatientMerge) {
          var Parameters = new FhirResFactory.CreateMergePatientParameters();
          BodyData = JSON.stringify(Parameters, null, 4);
        } else {
          var Bundle = new FhirResFactory.CreateADTBundle();
          BodyData = JSON.stringify(Bundle, null, 4);
        }

        BreakPoint;
        if (IsTestCase) {
          var fso = new ActiveXObject("Scripting.FileSystemObject");
          var fh = fso.CreateTextFile("C:\\temp\\HL7Connect\\Logging\\Output.json", true);
          fh.Write(BodyData);
          fh.Close();
        }
        CallRESTService = true;
      }

      //Data Processed now attempt to call  REST Service
      if (CallRESTService) {
        BreakPoint;
        //oLogger.Log("Logging request body data about to be sent:");
        //oLogger.Log("-------------------------------------------------------------");
        //oLogger.Log(BodyData);
        var Client = new FhirClient();
        var POSTOutcome = null;
        if (oModel.IsPatientMerge) {
          POSTOutcome = new Client.POST(oModel.FacilityConfig.Fhir.FhirEndpoint, oModel.FacilityConfig.Fhir.OperationNameMergePatient, oModel.FacilityConfig.Fhir.AuthorizationToken, BodyData);
        } else {
          POSTOutcome = new Client.POST(oModel.FacilityConfig.Fhir.FhirEndpoint, oModel.FacilityConfig.Fhir.OperationNameProcessMessage, oModel.FacilityConfig.Fhir.AuthorizationToken, BodyData);
        }
        if (!POSTOutcome.Error && POSTOutcome.HttpStatus == 200) {
          oLogger.Log("Data received: " + POSTOutcome.DataReceived);
          //Message has been sent successfully, event complete!        
        } else if (POSTOutcome.HttpStatus == 404) {
          var StopInterfaceErrorMsg = "Confirm the FHIR endpoint is avavable at : " + oModel.FacilityConfig.Fhir.FhirEndpoint;
          oLogger.Log("HTTP Status Code: " + POSTOutcome.HttpStatus + " Server Not Found");
          oLogger.Log(StopInterfaceErrorMsg);
          oModel.FacilityConfig.Fhir.FhirEndpoint
          RejectMessage(StopInterfaceErrorMsg);
          StopInterface(StopInterfaceErrorMsg, IsTestCase);
        } else if (!POSTOutcome.Error) {
          //We have some other HTTP error code
          var StopInterfaceErrorMsg = ComposeErrorMessageFromFhirResource(POSTOutcome.DataReceived);
          oLogger.Log("HTTP Status Code: " + POSTOutcome.HttpStatus);
          oLogger.Log("Message: " + StopInterfaceErrorMsg);
          oLogger.Log("HTTP Body: " + POSTOutcome.DataReceived);
          RejectMessage(StopInterfaceErrorMsg);
          StopInterface(StopInterfaceErrorMsg, IsTestCase);
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
      var ErrorMsg = "Unknown Scripting exception of :" + Exec.message;
      oLogger.Log(ErrorMsg);
      oLogger.Log("Error Message: " + Exec.message);
      RejectMessage(ErrorMsg);
      StopInterface(ErrorMsg, IsTestCase);
    }

    //Function to stop the interface if 'oModel.FacilityConfig.MaxRejectBeforeInterfaceStop' Reject Count max reached    
    function StopInterface(ErrorMsg, IsTestCase) {
      if (IsTestCase == false) {
        var oInterfaceOut = Kernel.Getinterface(oModel.FacilityConfig.NameOfInterfaceRunningScript);
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

    function ComposeProcessMessageErrorMessage(BundleJson) {
      BreakPoint;
      var DefaultErrorMessage = "Unable to obtain message from server retuned process ADT message Bundle Resource body content. Please check the logs.";
      var ErrorMessage = "";
      try {
        var Bundle = JSON.parse(BundleJson);
        if (Bundle.entry.length > 1) {
          for (var i = 0; (i < Bundle.entry.length); i++) {
            var Entry = Bundle.entry[i];
            if (Entry.resource.resourceType === "OperationOutcome") {
              FoundOperationOutcomeResources = true;
              ErrorMessage = GetOperationOutcomeMessageString(oOpOutCome);
              if (ErrorMessage == "") {
                return DefaultErrorMessage;
              } else {
                return ErrorMessage;
              }
            }
          }
        }
      } catch (Exec) {
        return DefaultErrorMessage;
      }
    }

    function ComposeErrorMessageFromFhirResource(ResourceJson) {
      BreakPoint;
      var DefaultErrorMessage = "Unable to obtain message from server retuned process ADT message Bundle Resource body content. Please check the logs.";
      var ErrorMessage = "";
      try {
        var Resource = JSON.parse(ResourceJson);
        if (Resource.resourceType === "OperationOutcome") {
          ErrorMessage = GetOperationOutcomeMessageString(Resource)
          return ErrorMessage;
        } else if (Resource.resourceType === "Bundle") {
          if (Resource.entry.length > 1) {
            for (var i = 0; (i < Resource.entry.length); i++) {
              var Entry = Resource.entry[i];
              if (Entry.resource.resourceType === "OperationOutcome") {
                if (ErrorMessage == "") {
                  ErrorMessage = GetOperationOutcomeMessageString(Entry.resource);
                } else {
                  ErrorMessage = ErrorMessage + ", " + GetOperationOutcomeMessageString(Entry.resource);
                }
              }
            }
            if (ErrorMessage == "") {
              return DefaultErrorMessage;
            } else {
              return ErrorMessage;
            }
          }
        }
      } catch (Exec) {
        return DefaultErrorMessage;
      }
    }

    function GetOperationOutcomeMessageString(OperationOutcome) {
      var ErrorMessage = "";
      if (OperationOutcome.issue != undefined) {
        for (var i = 0; (i < OperationOutcome.issue.length); i++) {
          var oIssue = OperationOutcome.issue[i];
          if (oIssue.details != undefined && oIssue.details.text != undefined) {
            if (ErrorMessage == "") {
              ErrorMessage = oIssue.details.text;
            } else {
              ErrorMessage = ErrorMessage + ", " + oIssue.details.text;
            }
          }
        }
      }
      return ErrorMessage;
    }
  }