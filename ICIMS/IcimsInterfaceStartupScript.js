function Main(aEvent)
{
  //procedure DefineCustomLog(Name : String; Description : String; Filename : String; Header : String; MaxSize : Integer); 
  Kernel.DefineCustomLog("IcimsLog", "IcimsLog","IcimsLog.log", "Icims Logging", 20000);
}