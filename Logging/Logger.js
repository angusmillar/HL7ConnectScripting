
//Global Enum
var _CustomLogNameType = {
  Icims: "IcimsLog",
  IcimsPathology: "IcimsPathologyLog",
  PASFhir: "PASFhirLog"
};

function Main(aEvent) {
  //procedure DefineCustomLog(Name : String; Description : String; Filename : String; Header : String; MaxSize : Integer); 
  Kernel.DefineCustomLog(_CustomLogNameType.Icims, _CustomLogNameType.Icims, _CustomLogNameType.Icims + ".log", "Icims ADT Logging", 20000);
  Kernel.DefineCustomLog(_CustomLogNameType.IcimsPathology, _CustomLogNameType.IcimsPathology, _CustomLogNameType.IcimsPathology + ".log", "Icims Pathology Logging", 20000);
  Kernel.DefineCustomLog(_CustomLogNameType.PASFhir, _CustomLogNameType.PASFhir, _CustomLogNameType.PASFhir + ".log", "PAS Fhir Logging", 20000);
}

function Logger() {

  //CustomLogName must be one of the DefinedCustomLogs registered in the Kernel above.
  this.CustomLogName = null;
  this.DisableLogging = false;

  this.SetDisableLogging = function (isDisabled) {
    this.DisableLogging = isDisabled;
  }

  this.SetCustomLogName = function (CustomLogNameType) {
    if (CustomLogNameType.toUpperCase() == _CustomLogNameType.Icims.toUpperCase()) {
      this.CustomLogName = _CustomLogNameType.Icims;
    } else if (CustomLogNameType.toUpperCase() == _CustomLogNameType.IcimsPathology.toUpperCase()) {
      this.CustomLogName = _CustomLogNameType.IcimsPathology;
    } else if (CustomLogNameType.toUpperCase() == _CustomLogNameType.PASFhir.toUpperCase()) {
      this.CustomLogName = _CustomLogNameType.PASFhir;
    } else {
      var LogTypeList = [];
      for (var Log in _CustomLogNameType) {
        LogTypeList.push(Log);
      }
      var Logs = LogTypeList.join(" or ");
      throw new Error("Unknowen Custom Log Name Type parameter of '" + CustomLogNameType + "' passed to the Logger script. Allowed: (" + Logs + ")");
    }
  }

  this.Log = function (message) {
    if (this.DisableLogging == false)
    {
      var currentdate = new Date();
      var datetime = currentdate.toDateString() + " : "
        + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
      Kernel.WriteToCustomLog(this.CustomLogName, datetime + ": " + message + "\r" + "\n")
    }
  }
}



