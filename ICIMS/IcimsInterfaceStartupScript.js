function Main(aEvent)
{
  //procedure DefineCustomLog(Name : String; Description : String; Filename : String; Header : String; MaxSize : Integer); 
  Kernel.DefineCustomLog("IcimsLog", "IcimsADTLog","IcimsADTLog.log", "Icims ADT Logging", 20000);
  Kernel.DefineCustomLog("IcimsPathologyLog", "IcimsPathologyLog","IcimsPathologyLog.log", "Icims Pathology Logging", 20000);
}