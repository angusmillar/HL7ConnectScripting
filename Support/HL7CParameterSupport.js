function HL7CParameterSupport(oLogger, Parameter) {

  var ParameterMask = "[SiteCode]|[EnvironmentCode]";
  this.SiteCode = null;
  this.Enviroment = null;
  this.EnviromentCodes = {
    TEST: "TEST",
    DEV: "DEV",
    PROD: "PROD"
  };

  if (Parameter == undefined || Parameter == null) {
    throw new Error("The interface's script parameter is null or empty. It must conform to the following mask: " + ParameterMask);
  } else {

    var SplitParam = Parameter.split("|");

    if (SplitParam.length >= 1) {
      if (SplitParam[0] != "") {
        this.SiteCode = SplitParam[0].toUpperCase();
      }
    }

    if (this.SiteCode == null) {
      var ErrorMsg = "The interface's script parameter appears to have no SiteCode in the mask : " + ParameterMask;
      oLogger.Log(ErrorMsg);
      throw new Error(ErrorMsg);
    }

    if (SplitParam.length >= 2) {
      if (SplitParam[1] != "") {
        this.Enviroment = SplitParam[1].toUpperCase();;
      }
    }

    if (this.Enviroment == null) {
      var ErrorMsg = "The interface's script parameter appears to have no EnvironmentCode in the mask : " + ParameterMask;
      oLogger.Log(ErrorMsg);
      throw new Error(ErrorMsg);
    } else if (this.Enviroment in this.EnviromentCodes === false) {
      var ErrorMsg = "The interface's script parameter appears to have no EnvironmentCode must be one of (Dev, Test, Prod)";
    }
  }

}