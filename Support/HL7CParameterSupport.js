//enum of the sites configured for this script.
//Add to this list as new sites are brought on board.
var SiteContextEnum = {
  SAH: "SAH",
  RMH: "RMH"
};


//enum for Implementation
var ImplementationTypeEnum = {
  CLINISEARCHPATHOLOGY: "CLINISEARCHPATHOLOGY",
  CLINISEARCHRADIOLOGY: "CLINISEARCHRADIOLOGY",
  CLINISEARCHADT: "CLINISEARCHADT",
  ICIMSADT: "ICIMSADT",
  THEATER: "THEATER",
  CAREZONE: "CAREZONE"
};

//enum for Environment
var EnvironmentTypeEnum = {
  DEV: "DEV",
  TEST: "TEST",
  PROD: "PROD"
};

function HL7CParameterSupport(oLogger, Parameter) {

  var ParameterMask = "[SiteCode]|[EnvironmentCode]|{ImplementationCode}";
  this.SiteCode = null;
  this.Environment = null;
  this.Implementation = null;

  if (Parameter == undefined || Parameter == null) {
    throw new Error("The interface's script parameter is null or empty. It must conform to the following mask: " + ParameterMask);
  } else {

    var SplitParam = Parameter.split("|");

    // SiteCode
    if (SplitParam.length >= 1) {
      if (SplitParam[0] != "") {
        this.SiteCode = SplitParam[0].toUpperCase();
      }
    }

    if (this.SiteCode == null) {
      var ErrorMsg = "The interface's script parameter appears to have no SiteCode in the mask : " + ParameterMask;
      oLogger.Log(ErrorMsg);
      throw new Error(ErrorMsg);
    } else if (this.SiteCode in SiteContextEnum === false) {
      var ErrorMsg = "The interface's script parameter appears to have no SiteCode must be one of (RMH, SAH)";
      oLogger.Log(ErrorMsg);
      throw new Error(ErrorMsg);
    }

    //EnvironmentCode
    if (SplitParam.length >= 2) {
      if (SplitParam[1] != "") {
        this.Environment = SplitParam[1].toUpperCase();
      }
    }

    if (this.Environment == null) {
      var ErrorMsg = "The interface's script parameter appears to have no EnvironmentCode in the mask : " + ParameterMask;
      oLogger.Log(ErrorMsg);
      throw new Error(ErrorMsg);
    } else if (this.Environment in EnvironmentTypeEnum === false) {
      var ErrorMsg = "The interface's script parameter appears to have no EnvironmentCode must be one of (Dev, Test, Prod)";
      oLogger.Log(ErrorMsg);
      throw new Error(ErrorMsg);
    }

    //ImplementationCode (Optional)
    if (SplitParam.length >= 3) {
      if (SplitParam[2] != "") {
        this.Implementation = SplitParam[2].toUpperCase();

        if (this.Implementation == null) {
          var ErrorMsg = "The interface's script parameter appears to have no ImplementationCode in the mask : " + ParameterMask;
          oLogger.Log(ErrorMsg);
          throw new Error(ErrorMsg);
        } else if (this.Implementation in ImplementationTypeEnum === false) {
          var ErrorMsg = "The interface's script parameter appears to have no ImplementationCode";
          oLogger.Log(ErrorMsg);
          throw new Error(ErrorMsg);
        }


      }
    }

    
  }

}