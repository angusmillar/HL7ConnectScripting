function OpenCons(aEvent)
{
  Kernel.WriteToLog(DBG_SERIOUS,"Kernel Scripts Db Start");
  //Kernel.CreateDBODBC("PLSDATALOCAL","SQL Server Native Client 11.0","JOHN-PC\\SQLEXPRESS","PLSDataLocal","sata","jimmy123",50);
  Kernel.CreateDBODBC("PLSDATA","SQL Server Native Client 11.0","JOHNC-PC\\SQLEXPRESS","PLSData","sata","jimmy123",50);
  Kernel.CreateDBODBC("KSQLPLS","SQL Server Native Client 11.0","JOHNC-PC\\SQLEXPRESS","KSQLPLS","sata","jimmy123",50);
  Kernel.CreateDBDSN("CtreeACE64","c-treeACE ODBC Driver","ADMIN123","WellHello",30);
  Kernel.WriteToLog(DBG_SERIOUS, "Kernel Start Cons is finished");
}

function CloseCons(aEvent)
{
  Kernel.WriteToLog(DBG_SERIOUS, "Kernel Scripts Db Close");
  //Kernel.CloseDB("PLSDATALOCAL");
  Kernel.CloseDB("PLSDATA");
  Kernel.CloseDB("KSQLPLS");
  Kernel.CloseDB("ctreeACE64");
  Kernel.WriteToLog(DBG_SERIOUS,"Kernel Close Cons is finished");
}