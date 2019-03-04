<%include $script$\MaterLib.js%>
<%include $script$\SQLLib.js%>
<%include $script$\DBaseLib.js%>

function Main(aEvent)
{
  alert("MAIN Function in ADT Script is processing");
  Logger(DBG_PROCESS,"","","","Running the New ADT_iPM Javascript Record function");
  //Logger(DBG_ERROR,"ADT_IPM_Record","john.carey@mater.org.au","HL7ConnectGW1@mater.org.au","Running the New ADT_iPM Javascript Record function");
  var m = aEvent.message.hl7;
  //Logger(DBG_ANNOUNCE,"HL7Connect Pathology ADT Ready to process Message","john.carey@mater.org.au","HL7Connect@mater.org.au",m.source);
  var SegNum = m.SegmentCount;
  var SMsgID = m.MsgId;
  var SMsgType = m.MessageType;
  var SMsgEvent = m.Event;
  if ((SMsgType == "MFN") || (SMsgType == "SIU"))
  {
    Logger(DBG_WARNING,"","","","ADT Record Script HL7 Message not to be processed - SMsgID: " + SMsgID);
    return;
  }
  Logger(DBG_PROCESS,"","","","Read the HL7 Message and create a new HL7Data Object for processing");
  var HL7Data = new hl7data(m);
  Logger(DBG_PROCESS,"","","","Newly returned HL7Data object values: " + HL7Data.MsgID + "/" + HL7Data.PatID.Urno + "/" + HL7Data.Event);
  ADTUpdate(aEvent,m,HL7Data);
  Breakpoint;
  //If no Mater URNO or message not and ADT type then cleanup and return
  if ((HL7Data.PatID.Urno == "") || (SMsgType.toUpperCase() != "ADT"))
  {
    if (HL7Data.PatID.Urno == "")
      var msg = "ADT Record Script HL7 Message received with no Mater URNO, Message ID: " + HL7Data.MsgID;
    else
      var msg = "The Pathology ADT feed has processed a message not defined as ADT, Message ID: " + HL7Data.MsgID;
    //Logger(DBG_ANNOUNCE,"HL7Connect Pathology ADT SQL Error","john.carey@mater.org.au","",msg);
    m = null;
    HL7Data = null;
    return;
  }
  //Logger(DBG_ANNOUNCE,"HL7Connect Pathology ADT Ready to process Message","john.carey@mater.org.au","HL7Connect@mater.org.au",m.source);
  //If Delete or Merge message update SQL HostPID table otherwise add/modify HostPID for ADT message
  //Obtain SQL database data on this Patient if already in DB otherwise return defaults.
  var HostPidInfo = GetHostPIDInfo(aEvent,m,HL7Data,"PLSData","tblHostPID");
  switch (SMsgEvent.toUpperCase())
  {
    case ("A29"):
    {
      if (HostPidInfo.pidkey != 0)
      {
        //'alert("DeletePatient");
        HostPID(aEvent,m,HL7Data,"PLSData","tblHostPID","DELETE");
      }
      else
      {
        Logger(DBG_ANNOUNCE,"HL7Connect ADT_Record Script Error","john.carey@mater.org.au","HL7Connect@mater.org.au","Record Script ADT A29 Patient Delete but no Patient Record in SQL HostPID Table: " + HL7Data.MsgID);
      }
      break;
    }
    case ("A34"):
    {
      //'The PID segment of the A34 contains the surviving patient ID information. The MRG segment contains the non-surviving patient information.
      //'Check if the Patient has been seen previously by getting the HostPidKey. If the Patient ID Key is not found return "0"
      //'Ignore Merge Patient with a Q in the ID
      if ((HostPidInfo.pidkey != 0) && HostTablePatient(aEvent,m,HL7Data,"PLSData","tblHostPID",HL7Data.MrgID))
      {
        //'alert("Merge Patients");
        HostPID(aEvent,m,HL7Data,"PLSData","tblHostPID","MERGE");
      }
      else
      {
        if (strFound(HL7Data.MrgID,"Q") != -1)
        {
          Logger(DBG_ANNOUNCE,"HL7Connect ADT_Record Script Error","john.carey@mater.org.au","HL7Connect@mater.org.au","Record Script ADT A34 Merge with Mrg Segment Identifier not found in SQL HostPID Table: " + HL7Data.MsgID);
        }
      }
      break;
    }
    default:
    {
      HostPID(aEvent,m,HL7Data,"PLSData","tblHostPID","PROCESS");
      var PidInfo = GetHostPIDInfo(aEvent,m,HL7Data,"PLSData","tblHostPID");
      if (m.CountSegment("IN1")!=0)
      {
        HostINS(aEvent,m,HL7Data,"PLSData","tblHostInsurer","PROCESS");
        switch (true)
        {
          case ((SMsgEvent == "A11") || (SMsgEvent == "A27")):
          {
            HostEpeDelete(aEvent,m,HL7Data,"PLSData","tblHostEpe","PROCESS");
          }
          case ("A13"):
          {
            //HostPatIN(aEvent,m,HL7Data,"PLSData","tblHostEpe");
            Logger(DBG_ANNOUNCE,"HL7Connect ADT_Record Script A13","john.carey@mater.org.au","HL7ConnectGW@mater.org.au","A13 message for Case A13 in record script: " + HL7Data.MsgID);
          }
          default:
          {
            HostPatIN(aEvent,m,HL7Data,"PLSData","tblHostPatIN",PidInfo);
            if ((HL7Data.PatID.Urno != "") && ((HL7Data.VisitNumber != "") && (HL7Data.VisitNumber != "0")))
            {
              HostEpe(aEvent,m,HL7Data,"PLSData","tblHostEpe",PidInfo);
            }
          }
        }
      }
    }
  }
  //Cleanup and finish processing
  HL7Data = null;
  return;
}

function HostEpe(aEvent,m,HL7Data,dbase,tbl,HPInfo)
{
  //alert("MAIN HostEpe Function is now Processing");
  //'To deal with IN1 issues in PLS
  //'If only single IN1 segment for Patient Class I or P then add Episode Insurer
  //'PatClass may be I,O,P,C,Y (C removed in iIE5 release)
  //if (IN1Count = 1)  and ((PatClass = "I") or (PatClass = "P")) and ((SMsgEvent = "A01") or (SMsgEvent = "A08") or (SMsgEvent = "A14"))
  //Breakpoint;
  var db = Kernel.GetDB(dbase);
  var wList=""; var fieldList=""; var resultList=""; var updateList=""; var hostEpeInsKey="";
  if ((m.CountSegment("IN1") == 1) && ((HL7Data.PatClass.toUpperCase() == "I") || (HL7Data.PatClass.toUpperCase() == "P")) && ((m.Event.toUpperCase() == "A01") || (m.Event.toUpperCase() == "A08") || (m.Event.toUpperCase() == "A14")))
  {
    //alert("Update Epe with Insurer");
    //'if count IN1 = 1 then add hostEpe with the visit Insurer
    var hostEpeInsKey = db.Lookup("tblHostInsurer","InsuranceCode",(m.Segment("IN1",0).Element("3-1").AsString),"HostInsKey","-1");
    wList = tbl + ".HostVisitNumber) = '" + HL7Data.VisitNumber + "'";
    fieldList = "HostPidKey,HostVisitNumber,HostEventReasonCode,HostPreAdmitNumber,HostAssignedLocationWard,HostAssignedLocationHospital,HostPriorLocationWard,HostPriorLocationHospital,HostPatientClass,HostFacilityCode,HostAdmitDateTime,HostDischargeDateTime,HostInsKey,HostMaterURNO,HostSMsgID";
    resultList = "'" + HPInfo.pidkey + "','" + HL7Data.VisitNumber + "','" + HL7Data.ERCode + "','" + HL7Data.PreAdmitNum + "','" + HL7Data.APLWard + "','" + HL7Data.APLHosp + "','" + HL7Data.PrevAPLWard + "','" + HL7Data.PrevAPLHosp + "','" + HL7Data.PatClass + "','" + HL7Data.FCode + "','" + HL7Data.AdmDate + "','" + HL7Data.DschDate + "','" + hostEpeInsKey + "','" + HL7Data.PatID.Urno + "','" + HL7Data.MsgID + "'";
    updateList = "HostPidKey = '" + HPInfo.pidkey + "', HostVisitNumber = '" + HL7Data.VisitNumber + "', HostEventReasonCode = '" + HL7Data.ERCode + "', HostPreAdmitNumber = '" + HL7Data.PreAdmitNum + "', HostAssignedLocationWard = '" + HL7Data.APLWard + "', HostAssignedLocationHospital = '" + HL7Data.APLHosp + "', HostPriorLocationWard = '" + HL7Data.PrevAPLWard + "', HostPriorLocationHospital = '" + HL7Data.PrevAPLHosp + "', HostPatientClass = '" + HL7Data.PatClass + "', HostFacilityCode = '" + HL7Data.FCode + "', HostAdmitDateTime = '" + HL7Data.AdmDate + "', HostDischargeDateTime = '" + HL7Data.DschDate +"', HostInsKey = '" + hostEpeInsKey + "', HostMaterUrno = '" + HL7Data.PatID.Urno + "', HostSMsgID = '" + HL7Data.MsgID + "'";
  }
  else
  {
    //'if count IN1 = 0 or is >1 then add hostEpe without visit Insurer
    //var hostEpeInsKey = db.Lookup("tblHostInsurer","InsuranceCode",(m.SegmentByIndex("IN1").Element("3-1").AsString),"HostInsKey","");
    wList = tbl + ".HostVisitNumber) = '" + HL7Data.VisitNumber + "'";
    fieldList = "HostPidKey,HostVisitNumber,HostEventReasonCode,HostPreAdmitNumber,HostAssignedLocationWard,HostAssignedLocationHospital,HostPriorLocationWard,HostPriorLocationHospital,HostPatientClass,HostFacilityCode,HostAdmitDateTime,HostDischargeDateTime,HostMaterURNO,HostSMsgID";
    resultList = "'" + HPInfo.pidkey + "','" + HL7Data.VisitNumber + "','" + HL7Data.ERCode + "','" + HL7Data.PreAdmitNum + "','" + HL7Data.APLWard + "','" + HL7Data.APLHosp + "','" + HL7Data.PrevAPLWard + "','" + HL7Data.PrevAPLHosp + "','" + HL7Data.PatClass + "','" + HL7Data.FCode + "','" + HL7Data.AdmDate + "','" + HL7Data.DschDate + "','" + HL7Data.PatID.Urno + "','" + HL7Data.MsgID + "'";
    updateList = "HostPidKey = '" + HPInfo.pidkey + "', HostVisitNumber = '" + HL7Data.VisitNumber + "', HostEventReasonCode = '" + HL7Data.ERCode + "', HostPreAdmitNumber = '" + HL7Data.PreAdmitNum + "', HostAssignedLocationWard = '" + HL7Data.APLWard + "', HostAssignedLocationHospital = '" + HL7Data.APLHosp + "', HostPriorLocationWard = '" + HL7Data.PrevAPLWard + "', HostPriorLocationHospital = '" + HL7Data.PrevAPLHosp + "', HostPatientClass = '" + HL7Data.PatClass + "', HostFacilityCode = '" + HL7Data.FCode + "', HostAdmitDateTime = '" + HL7Data.AdmDate + "', HostDischargeDateTime = '" + HL7Data.DschDate +"', HostMaterUrno = '" + HL7Data.PatID.Urno + "', HostSMsgID = '" + HL7Data.MsgID + "'";
  }
  //Logger(DBG_ANNOUNCE,"HL7Connect ADT_Record Script","john.carey@mater.org.au","HL7Connect@mater.org.au","HostEpe SQL entry begin: " + HL7Data.MsgID);
  ProcSQLData(dbase,tbl,HL7Data,wList,fieldList,resultList,updateList,"SC",false);
  wList="";fieldList="";resultList="";updateList="";hostEpeInsKey="";
  db = null;
}

function HostPatIN(aEvent,m,HL7Data,dbase,tbl,HPInfo)
{
  //'alert("MAIN HostPatIN Function is now Processing");
  var db = Kernel.GetDB(dbase);
  var wList=""; var fieldList=""; var resultList=""; var updateList=""; var hostInsKey="";
  var fieldList = "HostPIDKey,HostInsKey,InsPlanID,InsPolicyNumber,InsPlanEffectiveDate,InsPlanExpirationDate,HostEpeKey";
  for (var i=0; i<HL7Data.PatINS.length; i++)
  {
    //Initialise each list on each loop except the fieldList
    wList="";resultList="";updateList="";hostInsKey="";
    hostInsKey = db.Lookup("tblHostInsurer","InsuranceCode",HL7Data.PatINS[i][0],"HostInsKey","-1");
    wList = tbl + ".HostPIDKey) = '" + HPInfo.pidkey + "' and (" + tbl + ".HostInsKey) = '" + hostInsKey + "'";
    resultList = "'" + HPInfo.pidkey + "','" + hostInsKey + "','" + HL7Data.PatINS[i][2] + "','" + HL7Data.PatINS[i][3] + "','" + HL7Data.PatINS[i][4] + "','" + HL7Data.PatINS[i][5] + "','" + HL7Data.VisitNumber + "'";
    updateList = "HostPIDKey = '" + HPInfo.pidkey + "', HostInsKey = '" + hostInsKey + "', InsPlanID = '" + HL7Data.PatINS[i][2] + "', InsPolicyNumber = '" + HL7Data.PatINS[i][3] + "' , InsPlanEffectiveDate = '" + HL7Data.PatINS[i][4] + "', InsPlanExpirationDate = '" + HL7Data.PatINS[i][5] + "',HostEpeKey = '" + HL7Data.VisitNumber + "'";
    //Logger(DBG_ANNOUNCE,"HL7Connect ADT_Record Script","john.carey@mater.org.au","HL7Connect@mater.org.au","HostPatIN SQL entry begin: " + HL7Data.MsgID);
    ProcSQLData(dbase,tbl,HL7Data,wList,fieldList,resultList,updateList,"SC",false);
  }
  wList="";fieldList="";resultList="";updateList="";hostInsKey="";
  db = null;
}

function HostEpeDelete(aEvent,m,HL7Data,dbase,tbl)
{
  //'alert("MAIN HostEpeDelete Function is now Processing");
  var wList=""; var fieldList=""; var resultList=""; var updateList="";
  var fieldList = "HomeVisitNumber";
  wList = tbl + ".HostVisitNumber) = '" + HL7Data.VisitNumber + "'";
  resultList = "'" + HL7Data.VisitNumber + "'";
  updateList = "HostVisitNumber = '" + HL7Data.VisitNumber + "'";
  ProcSQLData(dbase,tbl,HL7Data,wList,fieldList,resultList,updateList,"CA",true);
  wList="";fieldList="";resultList="";updateList="";
}

function HostINS(aEvent,m,HL7Data,dbase,tbl)
{
  //'alert("MAIN HostINS Function is now Processing");
  //Build a Host Insurance table with all insurance details as provided in messages.
  var wList=""; var fieldList=""; var resultList=""; var updateList="";
  var fieldList = "InsuranceCode,InsuranceDescription";
  for (var i=0; i<HL7Data.PatINS.length; i++)
  {
    //Initialise each list on each loop except the fieldList
    wList="";resultList="";updateList="";
    wList = tbl + ".InsuranceCode) = '" + HL7Data.PatINS[i][0] + "'";
    resultList = "'" + HL7Data.PatINS[i][0] + "','" + HL7Data.PatINS[i][1] + "'";
    updateList = "InsuranceCode = '" + HL7Data.PatINS[i][0] + "', InsuranceDescription = '" + HL7Data.PatINS[i][1] + "'";
    //Logger(DBG_ANNOUNCE,"HL7Connect ADT_Record Script","john.carey@mater.org.au","HL7Connect@mater.org.au","HostINS SQL entry begin: " + HL7Data.MsgID);
    ProcSQLData(dbase,tbl,HL7Data,wList,fieldList,resultList,updateList,"SC",false);
  }
  wList="";fieldList="";resultList="";updateList="";
}

function GetHostPIDInfo(aEvent,m,HL7Data,dbase,tbl)
{
  var hpid = new Array();
  var db = Kernel.GetDB(dbase);
  var con = db.GetConnection(dbase);
  con.SQL = "SELECT * FROM " + tbl + " WHERE InternalID = '" + HL7Data.PatID.Urno + "' ORDER BY HostPIDKey DESC";
  con.Prepare;
  con.Execute;
  if (con.FetchNext) //'Select record if found.
  {
    //alert("Pat found so Processing data from Database");
    hpid.fnd = "true";
    hpid.pidkey = con.ColStringByName("HostPidKey");
    hpid.pidid = con.ColStringByName("InternalId");
    hpid.piddel = con.ColStringByName("DeleteEvent");
    hpid.pidmrg = con.ColStringByName("MergeEvent");
  }
  else
  {
    //alert("HostPID not found so populate with defaults");
    hpid.fnd = "false";
    hpid.pidkey = "0";
    hpid.pidid = "";
    hpid.piddel = "false";
    hpid.pidmrg = "false";
  }
  con.Terminate;
  db.YieldConnection(con,'');
  db = null;
  con = null;
  return(hpid);
}

function HostPID(aEvent,m,HL7Data,dbase,tbl,HostPIDAction)
{
  //'alert("MAIN HostPID Function is now Processing");
  var wList=""; var fieldList=""; var resultList=""; var updateList="";
  if ((HostPIDAction.toUpperCase() == "DELETE") || (HostPIDAction.toUpperCase() == "MERGE"))
  {
    //HostPID Delete action does not actually delete the entry from the table but sets the delete Event to true.
    if (HostPIDAction.toUpperCase() == "DELETE")
    {
      //'alert("Delete Patient in HostPID");
      wList = tbl + ".InternalID) = '" + HL7Data.PatID.Urno + "' and (" + tbl + ".DeleteEvent) = 'False'";
      fieldList = "DeleteEvent";
      resultList = "'True'";
      updateList = "DeleteEvent = 'True'";
      //'Reset DeletePatient Marker
    }
    else
    {
      //'alert("Merge Patient in HostPID");
      wList = tbl + ".InternalID) = '" + HL7Data.PatID.Urno + "' and (" + tbl + ".MergeEvent) = 'False'";
      fieldList = "MergeEvent,MergedID";
      resultList = "'True','" + HL7Data.MrgID + "'";
      updateList = "MergeEvent = 'True', MergedID = '" + HL7Data.MrgID + "'";
      //'Reset MergePatient Marker
    }
  }
  else
  {
    //'alert("Normal Patient in HostPID");
    wList = tbl + ".InternalID) = '" + HL7Data.PatID.Urno +"' and (" + tbl + ".DeleteEvent) = 'False'";
    fieldList = "InternalID,Surname,Firstname,DOB,Sex,Address,PhoneHome,MedicareNumber,VeteransAffairNumber,EventDateTime";
    resultList = "'" + HL7Data.PatID.Urno + "','" + HL7Data.Surname + "','" + HL7Data.Given + "','" + HL7Data.oDob.FormatTimeStamp("yyyymmddhhnnss") + "','" + HL7Data.Sex + "','" + HL7Data.Adrs + "','" + HL7Data.PatTel.HomePhone + "','" + HL7Data.PatID.Medicare +"', '" + HL7Data.PatID.VetAff +"', '" + HL7Data.DTEvent + "'";
    updateList = "InternalID = '" + HL7Data.PatID.Urno +"', Surname = '" + HL7Data.Surname + "' , Firstname = '" + HL7Data.Given + "', DOB = '" + HL7Data.oDob.FormatTimeStamp("yyyymmddhhnnss") + "', Sex = '" + HL7Data.Sex + "', Address = '" + HL7Data.Adrs + "', PhoneHome = '" + HL7Data.PatTel.HomePhone + "', MedicareNumber = '" + HL7Data.PatID.Medicare + "', VeteransAffairNumber = '" + HL7Data.PatID.VetAff + "', EventDateTime = '" + HL7Data.DTEvent + "'";
    //vDeleteList = ""
  }
  //Logger(DBG_ANNOUNCE,"HL7Connect ADT_Record Script","john.carey@mater.org.au","HL7Connect@mater.org.au","HostPID SQL entry begin: " + HL7Data.MsgID);
  ProcSQLData(dbase,tbl,HL7Data,wList,fieldList,resultList,updateList,"SC",false);
  wList="";fieldList="";resultList="";updateList="";
}

function HostTablePatient(aEvent,m,HL7Data,dbase,tbl,ID)
{
  //'Select a Patient and return true of false
  var HTPFound = false;
  var db = Kernel.GetDB(dbase);
  var con = db.GetConnection(dbase);
  con.SQL = "SELECT * FROM " + tbl + " WHERE InternalID = '" + HL7Data.PatID.Urno + "'";
  con.prepare;
  con.execute;
  if (con.fetchnext)
  {
    HTPFound = true;
  }
  con.Terminate;
  db.YieldConnection(con,'');
  db = null;
  con = null;
  return(HTPFound);
}

function ADTUpdate(aEvent,m,HL7Data)
{
  var segNum = m.SegmentCount;
  for (var i=0; (i < segNum); i++)
  {
    var SegItem = m.SegmentByIndex(i).code;
    if (SegItem == "PID")
    {
      if ((m.SegmentByIndex(i).Element("8").defined) && (m.SegmentByIndex(i).Element("8").AsString == "I"))
      {
        m.SegmentByIndex(i).Element("8").AsString = "U";
        Logger(DBG_PROCESS,"HL7Connect ADT iPM Sex Update","john.carey@mater.org.au","HL7Connect@mater.org.au","ADT PID-8 field Updated from iPM 'I' to Kestral 'U' for PLS SMsgID: " + HL7Data.MsgID);
      }
      //'Change PID Address Suburb to UCASE for PLS

      if (m.SegmentByIndex(i).Field(11).defined)
      {
        if (m.SegmentByIndex(i).Field(11).RepeatCount > 1)
        {
          for (var r=0; r<m.SegmentByIndex(i).Field(11).RepeatCount; r++)
          {
            //Set address suburb to Uppercase
            m.SegmentByIndex(i).Field(11).Repeats(r).Component(3).AsString = m.SegmentByIndex(i).Field(11).Repeats(r).Component(3).AsString.toUpperCase();
          }
        }
        else
        {
          m.SegmentByIndex(i).Element("11-3").AsString = m.SegmentByIndex(i).Element("11-3").AsString.toUpperCase();
        }
      }
    }
    if (SegItem == "PV1")
    {
      if (m.SegmentByIndex(i).Element("3-1").defined)
      {
        var APL = m.SegmentByIndex(i).Element("3-1").AsString; //'Assigned Patient Location Ward
        var FacCode = m.SegmentByIndex(i).Element("3-4-1").AsString; //'Facility Code
        //'Modify FCode for 00318 ans 00309 Merge 06/2008 This may be set back shortly.
        if (FacCode == "00318")
        {
          switch (true)
          {
            case ((APL == "MPTFR") || (APL == "MPBS5") || (APL == "MPBS5N") || (APL == "MPPS5") || (APL == "MPPS5N") || (APL == "MP10") || (APL == "MP10C") || (APL == "MP11") || (APL == "MP11C") || (APL == "MP12") || (APL == "MP12C")):
            {
              m.SegmentByIndex(i).Element("3-4-1").AsString = "00309"
              break;
            }
            default: m.SegmentByIndex(i).Element("3-4-1").AsString = FacCode;
          }
        }
      }
    }
  }
  if (HL7Data.Unit != null)
  //if ((HL7Data.Unit != "") && (HL7Data.Unit.toLowerCase() != "undefined"))
  {
    var nw = HL7Connect_Now;
    var msg = "Date:" + nw.FormatTimeStamp("yyyymmdd") + " Time:" + nw.FormatTimeStamp("hhnnss") + ", " + HL7Data.MsgID + ", " + "Unit:" + HL7Data.Unit + ", " + "DocCode:" + HL7Data.DocCode + ", " + "DocSurn:" + HL7Data.DocSurn + ", " + "DocFname:" + HL7Data.DocFname + ", " + "VisitNumber:" + HL7Data.VisitNumber + ", " + "FinancialClass:" + HL7Data.FClass;
    appendFileData("C:\\Temp\\","C:\\Temp\\ADTiPM.txt",msg);
    nw = null;
  }
}