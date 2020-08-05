/****************************************************************************
 * Mater PATH Support functions
 ****************************************************************************/
/* function  : Logger
   purpose   : General logging and alerts
               Sends an alert if error is significant
               Call with Kernel constants:
               DBG_PROCESS : Debug info
               DBG_WARNING : Warning message - does not halt interface
               DBG_ERROR   : Error message - Alert IT but doesn't halt interface
               DBG_FATAL   : Fatal error - Interface halted
   paramaters: SendTo: Semi-Colon seperated list to send Email to
               SendFrom: Who the send came from
               level: Debug Level for logger
               mess: The message for the eamil.
   return    : void
*/
function Logger(level, subj, SendTo, SendFrom, mess) {
  var SendFrom = "HL7Connect@Mater.org.au";
  //STList = SendTo.split("\,");
  var d = new Date();
  mess = d.toDateString() + " " + d.toLocaleTimeString() + " " + mess;
  //iterate number of alerts
  //To Email to a user the level must be less than DBG_WARNING.
  if (level < DBG_WARNING) {
    AlertEmail(level, subj, SendTo, SendFrom, mess);
  }
  //To log all Logger events to the Kernel log the level must be less than the preset gateway level.
  //The gateways are normally set to DBG_EXCEPTIONS so DBG_WRONG is the first level of logging.
  //If level is DBG_WRONG or lower it will normally be recorded.
  Kernel.WriteToLog(level, mess);
}

// function : AlertEmail
// purpose  : Send an email message to someone
// return   : void
function AlertEmail(level, subj, SendTo, SendFrom, mess) {
  if (SendTo != "") {
    SendEmail("172.20.11.102", subj, SendTo, SendFrom, mess);
  }
}

//
// function : saveFile
// purpose  : Save a file containing PLS Epe LabNumber and Data
//            str1 is Data; str2 is folder; str3 is filename
// return   : Void
function saveEpeFile(str1, str2, str3) {
  var fso;
  var timestamp = HL7Connect_Now.FormatTimeStamp("yyyymmddhhnnss");
  //First ensure directory exist
  //alert("Data " + str1);
  //alert("Folder " + str2);
  //alert("Filename " + str3);
  //alert("Folder_Filename " + str2 + str3);
  fso = new ActiveXObject("Scripting.FileSystemObject");
  if (!fso.FolderExists(str2)) {
    //Logger(DBG_ERROR,"","","","Pat Epe Sample Folder: Epe Sample dir is undefined: " + str2);
    fso = null;
    return;
  }
  else {
    // Add data to file
    StringToFile(str1, str2 + str3);
  }
  fso = null;
  return;
}
//
// function : appendFileData
// purpose  : Save a file containing detail provided
//            fname is full filename; msg is data to append to file
// return   : Void
function appendFileData(fld, fname, msg) {
  var timestamp = HL7Connect_Now.FormatTimeStamp("yyyymmddhhnnss");
  //First ensure directory exist
  //alert("Filename " + fname);
  //alert("Folder_Filename " + str2 + str3);
  var ForAppending = 8;
  var fso = new ActiveXObject("Scripting.FileSystemObject");
  if (!fso.FolderExists(fld)) {
    Logger(DBG_ERROR, "", "", "", "File Date Folder does not exist so create it: " + fld);
    fso.CreateFolder(fld);
    //If file exists append data if not create and add data
    if (fso.FileExists(fname)) {
      var f = fso.OpenTextFile(fname, ForAppending, false);
      f.WriteLine(msg);
      f.Close();
      f = null;
      //AppendStringToFile(fname,msg);
    }
    else {
      var f = fso.CreateTextFile(fname, false);
      f.WriteLine(msg);
      f.Close();
      f = null;
      //StringToFile(fname,msg);
    }
  }
  else {
    //Folder exists so check file exists and append data if found else create file and add data
    if (fso.FileExists(fname)) {
      var f = fso.OpenTextFile(fname, ForAppending, false);
      f.WriteLine(msg);
      f.Close();
      f = null;
      //AppendStringToFile(fname,msg);
    }
    else {
      var f = fso.CreateTextFile(fname, false);
      f.WriteLine(msg);
      f.Close();
      f = null;
      //StringToFile(fname,msg);
    }
  }
  fso = null;
  return;
}

//
// function : strFound
// purpose  : Provide str1:String to search, str2: String to find
// return: return string or -1
function strFound(str1, str2) {
  //Logger(DBG_PROCESS,"","","",str1 + "/" + str2 + "/");
  var ss = str1.indexOf(str2);
  //Logger(DBG_PROCESS,"","","","Return from strFound: " + ss);
  return (ss);
}

//
// function : splitStr
// purpose  : return Array with split
function splitStr(str1, str2) {
  var ss = new Array();
  // Split at each space character.
  ss = str1.split(str2);
  //Logger(DBG_PROCESS,"","","","Split String function: " + ss[0] + "/" + ss[1]);
  return (ss);
}

//
// function : DateDiff
// purpose  : return the difference between 2 dates.
// Date 2 is always now
function dateDiff(str1, str2) {
  var dd;
  //Set the two dates
  //var today = new Date()
  //var christmas=new Date(today.getFullYear(), 11, 25) //Month is 0-11 in JavaScript
  //Set 1 day in milliseconds
  var one_day = 1000 * 60 * 60 * 24;
  //Calculate difference btw the two dates, and convert to days
  dd = str1.getTime() - str2.getTime();       //   )/(one_day))+ " days left until Christmas!")
  return (dd);
}

//
// function : diffdate
// purpose  : return the difference between 2 dates.
function diffDate(str1, str2) {
  var s1 = str1.split('/');
  var dObj1 = new Date(Number(s1[2]), Number(s1[1]), Number(s1[0]));
  var s2 = str2.split('/');
  var dObj2 = new Date(Number(s2[2]), Number(s2[1]), Number(s2[0]));
  var dd;
  //Set the two dates
  //var today = new Date()
  //var christmas=new Date(today.getFullYear(), 11, 25) //Month is 0-11 in JavaScript
  //Set 1 day in milliseconds
  var one_day = 1000 * 60 * 60 * 24;
  //Calculate difference btw the two dates, and convert to days
  dd = ((dObj1.getTime() - dObj2.getTime()) / one_day);      //   )/(one_day))+ " days left until Christmas!")
  return (dd);
}

//
// function : getDaysBetween
// purpose  : return the difference between 2 dates objects.
// return   : difference in days
//
function getDaysBetween(date1, date2) {
  // The number of milliseconds in one day
  var ONE_DAY = 1000 * 60 * 60 * 24
  // Convert both dates to milliseconds
  var date1_ms = date1.getTime()
  var date2_ms = date2.getTime()
  // Calculate the difference in milliseconds
  var difference_ms = Math.abs(date1_ms - date2_ms)
  // Convert back to days and return
  return Math.round(difference_ms / ONE_DAY)
}

//
// function : getTestListFromOBR
// purpose  : Get the full test list for this request comma seperated
// return   : the test list comma seperated
function getTestListFromOBR(m) {
  var vTestList = "";
  if (m.element("MSH-5").AsString.toUpperCase() == "DBASE") {
    vTestList = m.element("OBR-20").AsString.replace(/\,/g, ";");
  }
  else {
    var OBRCount = m.CountSegment("OBR");
    //if (OBRCount > 1)
    if (OBRCount > 0) {
      for (var i = 0; i < OBRCount; i++) {
        if (i == 0)
          vTestList = (m.element("OBR:" + i + "-4").AsString).toUpperCase();
        else
          vTestList = vTestList + ";" + (m.element("OBR:" + i + "-4").AsString).toUpperCase();
      }
    }
  }
  return (vTestList);
}

//
// function : getTestsDictionaryFromOBR
// purpose  : Get the full test list for this request in a Dictionary
// return   : the test list as this.Tsts
function getTestsDictionaryFromOBR(m) {
  var PLSTests = new ActiveXObject("Scripting.Dictionary");
  //PLSTests.add ("a", "test");
  if (m.element("MSH-5").AsString.toUpperCase() == "DBASE") {
    var tstList = m.element("OBR-20").AsString.split(",");
    for (var i = 0; i < tstList.length; i++) {
      PLSTests.add(i, tstList[i].toUpperCase());
    }
  }
  else {
    var OBRCount = m.CountSegment("OBR");
    if (OBRCount > 0) {
      for (var i = 0; i < OBRCount; i++) {
        PLSTests.add(i, (m.element("OBR:" + i + "-4").AsString).toUpperCase());
      }
    }
  }
  return (PLSTests);
}

//
// function : getSampleSetDictionary
// purpose  : Get the full sample list for this request in a Dictionary
// return   : the sample list as a Dictionary
//
function getSampleSetDictionary(m) {
  var PLSSamples = new ActiveXObject("Scripting.Dictionary");
  EpeSampleList = (m.element("OBR-18").AsString).toUpperCase().split(",");
  for (var i = 0; i < EpeSampleList.length; i++) {
    PLSSamples.add(i + 1, (EpeSampleList[i]));
  }
  return (PLSSamples);
}

//
// function : getResKey
// purpose  : To split the ORC order number to get the ResKey.
// return   : Reskey returned
function getResKey(m) {
  var PLSResKey = "";
  if ((strFound((m.element("ORC-3").AsString).toUpperCase(), "-") != -1)) {
    //var idArray = new Array();
    var iArr = splitStr((m.element("ORC-3").AsString), "-");  //' ORC3 Array
    switch (iArr.length) {
      case 2: PLSResKey = iArr[1];
        break;
      case 3: PLSResKey = iArr[2];
        break;
      default: PLSResKey = "";
    }
    //var PLSResKey = splitStr((m.element("ORC-3").AsString),"-")[1];  //' EpeNum
    //Logger(DBG_PROCESS,"","","","PLSResKey from hl7data objects: " + PLSResKey);
  }
  return (PLSResKey);
}

//
// function : getRDLCode
// purpose  : To split the ORC order number to get the RDL Code.
// return   : Reskey returned
function getRDLCode(m) {
  if ((strFound((m.element("ORC-3").AsString).toUpperCase(), "-") != -1)) {
    var iArr = splitStr((m.element("ORC-3").AsString), "-");  //' ORC3 Array
    if (iArr.length == 3) {
      var RDLCode = iArr[1];
    }
    else {
      var RDLCode = m.element("OBR-4-1").AsString.toUpperCase();
      //var RDLCode = "";
    }
    //Logger(DBG_PROCESS,"","","","RDlCode from hl7data objects: " + RDLCode);
  }
  return (RDLCode);
}

//
// function : getWard
// purpose  : to get the ward and rem characters
// return   : Ward returned
function getWard(m) {
  var tmpWrd = (m.element("PV1-3").AsString).toUpperCase();                           //' Ward
  if (strFound(tmpWrd, "\T\#38;") != -1) {
    tmpWrd = tmpWrd.replace("\T\#38;", "&");
  }
  if (strFound(tmpWrd, "#38;") != -1) {
    tmpWrd = tmpWrd.replace("#38;", "&");
  }
  //Set the Message value as tmpWrd
  m.element("PV1-3").AsString = tmpWrd.toUpperCase();
  return (tmpWrd);
}

//
// function : PLSDocCode from PV1 segment
// purpose  : Determine for Return PLSDocCode from multiple repeats
// return   : Return PLSDocCode for field defined
function getDocCode(m, fld) {
  var PV1Count = m.CountSegment("PV1");
  //this.Rqd = (m.element("PV1-8").AsString).toUpperCase();                           //' ReqDoc
  //Set default
  var elmnt = fld.toString() + "-1"
  //alert("elmnt: " + elmnt); 
  //var tmpRqd = (m.element("8-1").AsString).toUpperCase();                              //' ReqDoc
  //alert("tmpRqd: " + tmpRqd); 
  if (PV1Count > 0) {
    for (var i = 0; i < PV1Count; i++) {
      //'Get the current message Kestral UrNumber from PID-3 and if multiples ID's find the MR (MaterURNO) type and Medicare
      //if (m.element("PID-3").Defined && m.element("PID-3").AsString != "")
      //if ((m.Segment("PV1",i).Element("8-1").defined) && (m.Segment("PV1",i).Element("8-1").AsString != ""))
      if ((m.Segment("PV1", i).Element(elmnt).defined) && (m.Segment("PV1", i).Element(elmnt).AsString != "")) {
        //Logger(DBG_PROCESS,"","","","PID 3 defined and not nothing");
        //'always run loop regardless wether repeats or not
        //if ((m.Segment("PV1",i).Field(8).RepeatCount) >= 1)   //'Repeats are for 1 or more
        if ((m.Segment("PV1", i).Field(fld).RepeatCount) >= 1)   //'Repeats are for 1 or more
        {
          //Logger(DBG_PROCESS,"","","","PID3 has repeats to process: " + m.Segment("PID",i).Field(3).RepeatCount);
          for (var j = 0; j <= ((m.Segment("PV1", i).Field(fld).RepeatCount) - 1); j++) {
            var IdTypeCode = m.Segment("PV1", i).Field(fld).Repeats(j).Component(9).AsString;
            //Logger(DBG_PROCESS,"","","","idTypeCode: " + IdTypeCode);
            if ((m.Segment("PV1", i).Field(fld).Repeats(j).Component(9).AsString) == "AUSHIC") {
              //Logger(DBG_PROCESS,"","","","Mater URNO found");
              var tmpRqd = m.Segment("PV1", i).Field(fld).Repeats(j).Component(1).AsString;
              //Logger(DBG_PROCESS,"","","","PLS Doc Provider number found: " + tmpRqd);
            }
            if ((m.Segment("PV1", i).Field(fld).Repeats(j).Component(9).AsString) == "PLS") {
              var tmpRqd = m.Segment("PV1", i).Field(fld).Repeats(j).Component(1).AsString;
              //Logger(DBG_PROCESS,"","","","PLS Doc Provider number found: " + tmpRqd);
            }
          }
        }
      }
    }
  }
  return (tmpRqd);
  //alert("tmpRqd returned: " + tmpRqd); 
}

//
// function : replaceChar
// purpose  : to replace in RegExp characters
// return   : String Returned
function repAllChars(strRp, rpStr, shell) {
  //shell.Popup("ReplaceChrs: " + rpStr,undefined,undefined,64); // that's the #64?
  var repString = "[\\" + rpStr + "]";
  //shell.Popup("ReplaceChrs: " + repString,undefined,undefined,64); // that's the #64?
  var tmpStr = strRp.replace(new RegExp(repString, "gi"), rpStr);             //Convert String
  return (tmpStr);
}

//
// function : getServerName
// purpose  : to return the server that is the host
// return   : String Returned
function getServerName() {
  try {
    var WshNetwork = new ActiveXObject("WScript.Network");
    var serverName = WshNetwork.ComputerName;
    var dbName = "";
    if ((serverName == "C110984") || (serverName == "C143129")) {
      dbName = "PLSDataLocal";
    }
    else {
      dbName = "PLSData";
    }
    //Logger(DBG_ERROR,"","","","","Server Name for Database Access: " + dbName);
    WshNetwork = null;
  }
  catch (e) {
    //Logger(DBG_ERROR,"","","","","Wsh Scripting Host ERROR: Error with Function to generate UNK Doc Delete HL7 Message: " + dbName + ". ERROR: "+ e.description);
    return ("PLSData");
  }
  return (dbName);
}

//
// function : KeysDemo
// purpose  : to return the Dictionary tests Items as a String
// return   : String Returned
function KeysDemo(PLSTests) {
  var a, d, i, s;                  // Create some variables.
  a = (new VBArray(PLSTests.Items())).toArray();   // Get the keys.
  s = "";
  for (i in a)                  // Iterate the dictionary.
  {
    s += a[i] + " - ";
    //Logger(DBG_PROCESS,"TestList Items: " + a[i]);
  }
  return (s);                     // Return the results.
}

//
// function : isDate
// purpose  : to return true of false to a value as a date type
// return   : Boolean Returned
function isDate(value) {
  return (!isNaN(new Date(value).getYear()));
}

/*****************************************************************************
 * Classes and methods
 *****************************************************************************/

// class   : hl7data
// purpose : Constructer for HL7Data fields
//           Remember this is for all types of HL7 Messages in the gateway ORU ORM ADT etc
//
function hl7data(m) {
  //Alert("Create HL7 Object");
  BreakPoint;
  this.Event = m.Event;
  this.MsgType = m.MessageType;
  this.MsgID = (m.element("MSH-10").AsString).toUpperCase(); //' MsgID always as Uppercase
  // Default worksite to Main (Mater Lab)
  this.WorksiteCode = "MAIN";
  var site = m.element("MSH-4-1").AsString.split(/_/);
  if (site[1] != undefined) this.WorksiteCode = site[1];
  //ADT specific elements defined here.
  if (m.MessageType == "ADT") {
    this.Title = "";
    //DOB for ADT Patients is different to ORM Episodes (Epe = sDOB and Patients = vDOB)
    this.vDOB = (m.element("PID-7-1").AsString).substr(6, 2) + "/" + (m.element("PID-7-1").AsString).substr(4, 2) + "/" + (m.element("PID-7-1").AsString).substr(0, 4);      //'DOB from HL7 for SQL
    this.VAff = (m.element("PID-27-4").AsString).toUpperCase();                          //' Veterans Affair
    this.DTEvent = m.element("PID-33").AsString;                                         //'Date Time Event
    //Who Added and Date Added is different in ADT to ORM
    this.WAdded = (m.element("EVN-5-3").AsString).toUpperCase();                         //' Patient Added PLS By
    if (m.CountSegment("EVN") != 0 && m.element("EVN-2").Defined) {
      if (((m.element("EVN-4-1").defined) && (m.element("EVN-4-1").AsString != ""))) {
        this.ERCode = m.element("EVN-4-1").AsString; //'Patient Class
      }
      this.DAdded = (m.element("EVN-2").AsString).substr(6, 2) + "/" + (m.element("EVN-2").AsString).substr(4, 2) + "/" + (m.element("EVN-2").AsString).substr(0, 4);        //'Added Date
      var dadded = TDateAndTime();
      dadded.ReadDate('yyyymmdd', m.element("EVN-2").AsString, true);
      this.oDAdded = dadded;
      dadded = null;
    }
    else {
      this.DAdded = "";
    }
    //if ((m.element("PV1-19-1").defined) && (m.element("PV1-19-1").AsString != ""))
    if (m.CountSegment("PV1") != 0) {
      if ((m.element("PV1-19-1") != null) && (m.element("PV1-19-1").AsString != "")) {
        this.VisitNumber = m.element("PV1-19-1").AsString;    //'Visit number (iPM Host_Spells_Number)
      }
      else {
        this.VisitNumber = "0";
      }
      this.PatClass = m.element("PV1-2").AsString;            //'Patient Class
      this.APLWard = m.element("PV1-3-1").AsString;           //'Assigned Patient Location Ward
      this.APLHosp = m.element("PV1-3-4-1").AsString;         //'Assigned Patient Location Hosp
      this.PrevAPLWard = m.element("PV1-6-1").AsString;       //'Previous Assigned Patient Location Ward
      this.PrevAPLHosp = m.element("PV1-6-4-1").AsString;     //'Previous Assigned Patient Location Ward
      this.FCode = m.element("PV1-3-4-1").AsString;           //'iPM Facility Codes
      this.Unit = m.element("PV1-10").AsString;               //'Hospital Service field
      this.DocCode = m.element("PV1-7").AsString;             //'Doc Code
      this.DocSurn = m.element("PV1-7-2-1").AsString;         //'Doc Surname
      this.DocFname = m.element("PV1-7-3").AsString;          //'Doc First Name
      this.FClass = m.element("PV1-20").AsString;             //'Financial Class
      this.PreAdmitNum = m.element("PV1-5-1").AsString;       //'Waiting List Number
      this.AdmDate = m.element("PV1-44-1").AsString;          //'Admission Date Now
      this.DschDate = m.element("PV1-45-1").AsString;         //'Discharge Date Now
      this.PatINS = new getInsurance(m);                      //'Insurance Details
    }
    if (m.CountSegment("MRG") != 0) {
      if ((m.element("MRG-1-1").defined) && (m.element("MRG-1-1").AsString != "")) {
        this.MrgID = m.element("MRG-1-1").AsString; //'Merge PatientID
      }
    }
  }
  else {
    if (m.CountSegment("ORC") != 0) {
      this.OType = (m.element("ORC-1").AsString).toUpperCase();                           //' Order Control
      this.ReqNum = ((m.element("ORC-3").AsString).toUpperCase()).substr(0, 9);            //' EpeNum
      this.SecNum = ((m.element("ORC-4").AsString).toUpperCase());                        //' SecNum
      this.OStat = (m.element("ORC-5").AsString).toUpperCase();                           //' Order Status
      if (m.element("ORC-9").Defined) {
        this.DAdded = (m.element("ORC-9").AsString).substr(6, 2) + "/" + (m.element("ORC-9").AsString).substr(4, 2) + "/" + (m.element("ORC-9").AsString).substr(0, 4);   //'Added Date
        this.TAdded = (m.element("ORC-9").AsString).substr(8, 2) + ":" + (m.element("ORC-9").AsString).substr(10, 2);
        var dadded = TDateAndTime();
        dadded.ReadDate('yyyymmdd', m.element("ORC-9").AsString, true);
        this.oDAdded = dadded;
        dadded = null;
      }
      else {
        this.DAdded = "";
        this.TAdded = "";
      }
      this.WAdded = (m.element("ORC-10").AsString).toUpperCase();                         //' Episode Added PLS By
      this.OrdProv = (m.element("ORC-12").AsString).toUpperCase();                        //' Ordering Provider
    }
    if (m.CountSegment("OBR") != 0) {
      //Set ExtReq to blank if it is set to PLS
      //var extReq = m.element("OBR-2-1").AsString.toUpperCase();
      if (m.element("OBR-2-1").AsString.toUpperCase() == "PLS")
        this.ExtReq = "";
      else
        this.ExtReq = (m.element("OBR-2-1").AsString).toUpperCase();                     //' ExtReq
      this.Col = (m.element("OBR-10-1").AsString).toUpperCase();                         //' Collect
      this.CDate = (m.element("OBR-7").AsString).substr(6, 2) + "/" + (m.element("OBR-7").AsString).substr(4, 2) + "/" + (m.element("OBR-7").AsString).substr(0, 4);       //'Col Date
      this.CTime = (m.element("OBR-7").AsString).substr(8, 2) + ":" + (m.element("OBR-7").AsString).substr(10, 2);
      var cdate = TDateAndTime();
      cdate.ReadDate('yyyymmddhhmmss', m.element("OBR-7").AsString.toUpperCase(), true);
      this.oCDate = cdate;
      cdate = null;
      this.RDate = (m.element("OBR-14").AsString).substr(6, 2) + "/" + (m.element("OBR-14").AsString).substr(4, 2) + "/" + (m.element("OBR-14").AsString).substr(0, 4);    //'Rec Date
      this.RTime = (m.element("OBR-14").AsString).substr(8, 2) + ":" + (m.element("OBR-14").AsString).substr(10, 2);
      var rdate = TDateAndTime();
      rdate.ReadDate('yyyymmddhhmmss', m.element("OBR-14").AsString.toUpperCase(), true);
      this.oRDate = rdate;
      rdate = null;
      this.Tsts = getTestListFromOBR(m); //for ORM messages
      this.DicPLSTsts = getTestsDictionaryFromOBR(m); //for ORM messages
      this.PLSResKey = getResKey(m);
      this.RDLCode = getRDLCode(m);
      this.ScanList = (m.element("OBR-20").AsString).toUpperCase();                       //' DepartmentScanPrint Required
      this.EpeSampleList = (m.element("OBR-18").AsString).toUpperCase().replace(new RegExp("[\,]", "gi"), ";");       //' EpeSampleList Convert comma to semi-colon
      this.SamplesFound = false;
      if ((m.element("OBR-18").AsString).toUpperCase() != "") //' EpeSampleList has values
      {
        this.DicSampleList = getSampleSetDictionary(m);
        this.SamplesFound = true;
      }
      this.ResStatus = m.element("OBR-25").AsString.toUpperCase();                        //' OBR result status (used next)
      //Authorised time is not available on all messages so set a try to build this or a blank.
      if ((m.element("OBR-22").defined) && (m.element("OBR-22").AsString != "")) {
        this.ADate = (m.element("OBR-22").AsString).substr(6, 2) + "/" + (m.element("OBR-22").AsString).substr(4, 2) + "/" + (m.element("OBR-22").AsString).substr(0, 4);      //'Col Date
        this.ATime = (m.element("OBR-22").AsString).substr(8, 2) + ":" + (m.element("OBR-22").AsString).substr(10, 2);
        var adate = TDateAndTime();
        adate.ReadDate('yyyymmddhhnnss', m.element("OBR-22").AsString.toUpperCase(), true);
        this.oADate = adate;
        adate = null;
        //Added for Michael TAT Meta Data capture
        this.restime = m.element("OBR-22").AsString;    // DateTime Authorised
        var re = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
        //Initialise values
        this.Interimed = "";
        this.Authorised = "";
        if (this.restime.match(re)) {
          var sqlServerDate = RegExp.$1 + "-" + RegExp.$2 + "-" + RegExp.$3 + " " + RegExp.$4 + ":" + RegExp.$5 + ":" + RegExp.$6;
          if (this.ResStatus == "P") {
            this.Interimed = sqlServerDate;
          }
          else {
            if (this.ResStatus == "F" || this.ResStatus == "C") {
              this.Authorised = sqlServerDate;
            }
          }
        }
      }
      else {
        this.ADate = "";
        this.ATime = "";
      }
      this.Priority = (m.element("OBR-27-6").AsString).toUpperCase();                     //' Episode Priority
    }
    this.Middle = (m.element("PID-5-3").AsString).toUpperCase();                          //' Middle
    this.RegStat = (m.element("PID-6-1").AsString).toUpperCase();                         //' Registration status from Patient conditions for Cord HL7 messages
    //DOB for Episodes is different to Patients (Epe = sDOB and Patients = vDOB)
    if ((m.CountSegment("PV1") != 0)) {
      this.sDOB = (m.element("PID-7-1").AsString).toUpperCase();                            //' DOB as string from HL7
      this.Unit = (m.element("PV1-3-5").AsString).toUpperCase();                            //' Unit
      this.Hosp = (m.element("PV1-3-4").AsString).toUpperCase();                            //' Hospital
      this.Wrd = getWard(m);
      //Doc changed 01/04/2009 to have Prov Number first in list
      this.Rqd = getDocCode(m, 8);                                                          //' ReqDoc
      this.Rsd = getDocCode(m, 9);                                                          //' ResDoc
      //this.Rqd = (m.element("PV1-8").AsString).toUpperCase();                             //' ReqDoc
      //this.Rsd = (m.element("PV1-9").AsString).toUpperCase();                             //' ResDoc
      this.Cds = (m.element("PV1-52").AsString).toUpperCase();                              //' CopyDoctorList
    }
  }
  this.PatID = new patientID(m, "", "", "", "", "", "");
  // Dues to old code some messages have the Patient ID in simpleformat and PID-4 holds the PLS Pat key, so to allow for this
  if (this.PatID.PlsNum != "") {
    this.PLSNum = this.PatID.PlsNum;                                                        //' PLSNUM from PatID object from PID multiple Identifier HL7 messages
  }
  else {
    this.PLSNum = (m.element("PID-4").AsString).toUpperCase();                               //' PLSNUM from PID 4 in some messages
  }
  this.Surname = (m.element("PID-5-1").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");       //' Surname ' Convert apostrophe for Surname for SQL
  this.Given = (m.element("PID-5-2").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");         //' Given ' Convert apostrophe for Given for SQL
  this.PatCond = (m.element("PID-6").AsString).toUpperCase();                            //' Patient Conditions
  var dob = TDateAndTime();
  dob.ReadDate('yyyymmdd', m.element("PID-7-1").AsString.toUpperCase(), true);
  this.oDob = dob;
  this.DOB = dob.FormatTimeStamp("ddmmyyyy");  // Date of Birth
  dob = null;
  this.Sex = (m.element("PID-8").AsString).toUpperCase();                                //' Sex
  this.Add1 = (m.element("PID-11-1").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");      //' Add1 ' Convert apostrophe for Add1
  this.Add2 = (m.element("PID-11-2").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");      //' Add2 ' Convert apostrophe for Add2
  this.Sub = (m.element("PID-11-3").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");       //' Suburb ' Convert apostrophe for Suburb
  this.PCode = (m.element("PID-11-5").AsString).toUpperCase();                          //' PCode
  this.PatTel = new patientTL(m, "", "", "", "", "", "", "");
  //Setup for Address repeats in an javascript multi dim array.
  this.Add = new getAddress(m);
  this.Adrs = this.Add1 + " " + this.Add2 + " " + this.Sub + " " + this.PCode;  //'Full address.
  if (m.CountSegment("PV1") != 0) this.BDets = new epeBillDetails(m, "", "", "", "");
  //Logger(DBG_PROCESS,"","","","BillCode and BillType: " + this.BDets.BCode + "/" + this.BDets.BType);
  //this.toString  = hl7DataToString;                                                  //'To String Method
  m.StripEmptyRepeats(true);
}

//
// function : getAddress
// purpose  : to return the Address Array for the hl7data object
// return   : Array Returned
//
function getAddress(m) {
  var PIDCount = m.CountSegment("PID");
  var AddRepNum = m.segment("PID", 0).Field("11").RepeatCount;
  //alert("Repeats: " + AddRepNum); 
  var arrAddress = new Array();
  if (PIDCount > 0) {
    //alert("PID Count: " + PIDCount); 
    for (var i = 0; (i < (PIDCount)); i++) {
      for (var j = 0; (j < (AddRepNum)); j++) {
        //alert("Counters: " + i + "/" + j);
        this.Add1 = (m.segment("PID", i).Field(11).Repeats(j).Component(1).AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");      //' Add1 ' Convert apostrophe for Add1
        this.Add2 = (m.segment("PID", i).Field(11).Repeats(j).Component(2).AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");      //' Add2 ' Convert apostrophe for Add2
        //alert("New getAddress Address: " + this.Add2);
        this.Sub = (m.segment("PID", i).Field(11).Repeats(j).Component(3).AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");       //' Suburb ' Convert apostrophe for Suburb
        this.State = (m.segment("PID", i).Field(11).Repeats(j).Component(4).AsString).toUpperCase();                                           //' State
        this.PCode = (m.segment("PID", i).Field(11).Repeats(j).Component(5).AsString).toUpperCase();                                           //' PCode
        this.CCode = (m.segment("PID", i).Field(11).Repeats(j).Component(6).AsString).toUpperCase();                                           //' Country Code
        this.AType = (m.segment("PID", i).Field(11).Repeats(j).Component(7).AsString).toUpperCase();                                           //' Address Type
        arrAddress[j] = new Array(this.Add1, this.Add2, this.Sub, this.State, this.PCode, this.CCode, this.AType);
      }
    }
  }
  return (arrAddress);
}

//
// function : billDetails
// purpose : Constructor for billDetails class
// return : BillDetails object
//
function epeBillDetails(m, TBill, BCode, ADebt, BType) {
  this.TBill = (m.element("PV1-20").AsString).toUpperCase();                        //' BillCode/AltDebtor
  var TBill = (m.element("PV1-20").AsString).toUpperCase();                        //' BillCode/AltDebtor
  if (strFound(TBill, "/") != -1) {
    var arrTBill = splitStr(TBill, "/");
    this.BCode = arrTBill[0].toUpperCase();                                          //' Bill Code
    this.ADebt = arrTBill[1].toUpperCase();                                          //' Alt Debtor
  }
  else {
    var arrTBill = splitStr(TBill, "/");
    this.BCode = arrTBill[0].toUpperCase();                                          //' Bill Code
    this.ADebt = "";                                                                 //' Alt Debtor
  }
  if ((m.element("PV1-21").defined) && (m.element("PV1-21").AsString != ""))
    this.BType = (m.element("PV1-21").AsString).toUpperCase();                        //' Bill Type
  else
    this.BType = "";
  //Modify BType in some specific BCode cases
  switch (this.BCode) {
    case "MS": this.BType = "P";
    case "PRNF": this.BType = "P";
    case "PRNC": this.BType = "P";
    default: this.BType = this.BType;
  }
  return;
}

//
// function : getInsurance
// purpose  : to return the Insurance Details Array for the hl7data object
// return   : Array Returned
//
function getInsurance(m) {
  var arrInsurance = new Array();
  if (m.CountSegment("IN1") != 0) {
    //alert("IN1 Count: " + IN1Count);
    for (var i = 0; (i < m.CountSegment("IN1")); i++) {
      //alert("Counters: " + i + "/" + j);
      this.INSCode = (m.segment("IN1", i).Element("3-1").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");      //' INSCode ' Convert apostrophe for INSCode
      this.INSDesc = (m.segment("IN1", i).Element("4-1").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");      //' INSDesc ' Convert apostrophe for INSDesc
      this.INSPlanID = (m.segment("IN1", i).Element("2-1").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");    //' INSPlanID ' Convert apostrophe for INSPlanID
      this.INSPolicyNum = (m.segment("IN1", i).Element("36").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''"); //' INSPolicyNum ' Convert apostrophe for INSPolicyNum
      this.INSEffDate = (m.segment("IN1", i).Element("12").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");   //' INSEffDate ' Convert apostrophe for INSEffDate
      this.INSExpDate = (m.segment("IN1", i).Element("13").AsString).toUpperCase().replace(new RegExp("[\']", "gi"), "''");   //' INSExpDate ' Convert apostrophe for INSExpDate
      //If INS Code is VET add to PID3 as repeat
      //if ((MyArray(i,1) = "VET") and (vVetAffNumber = "")) then
      if (this.INSCode == "VET") {
        var PID3RepCount = m.Segment("PID", 0).Field(3).RepeatCount;
        m.Segment("PID", 0).Field(3).AddRepeat(true);
        m.Segment("PID", 0).Field(3).Repeats(PID3RepCount).Component(1).AsString = this.INSPolicyNum;
        m.Segment("PID", 0).Field(3).Repeats(PID3RepCount).Component(4).AsString = "AUSDVA";
        m.Segment("PID", 0).Field(3).Repeats(PID3RepCount).Component(5).AsString = "DV";
        var effdate = TDateAndTime();
        effdate.ReadDate("yyyymmdd", this.INSEffDate, true);
        m.Segment("PID", 0).Field(3).Repeats(PID3RepCount).Component(7).AsString = effdate.FormatTimeStamp("yyyymmdd");
        effdate = null;
        PID3RepCount = m.Segment("PID", 0).Field(3).RepeatCount;
      }
      arrInsurance[i] = new Array(this.INSCode, this.INSDesc, this.INSPlanID, this.INSPolicyNum, this.INSEffDate, this.INSExpDate);
    }
  }
  //if m.Segment("IN1",i).Element("4-1").defined then
  //'Insurance Description
  //MyArray(i,2) = m.Segment("IN1",i).Element("4-1").AsString
  //'msgbox MyArray(i,2),,"Ins Desc"
  //end if
  return (arrInsurance);
}

//
// function : PatientIDs
// purpose  : Constructor for PatientID class
// return   : PatientIDs object
//
function patientID(m, Urno, PlsNum, Medicare, VetAff, CordID, ADTPlsNum) {
  var PIDCount = m.CountSegment("PID");
  //var DateTimeNow = HL7Connect_Now.FormatTimeStamp("dd/mm/yyyy");
  this.Urno = ""; this.PlsNum = ""; this.Medicare = ""; this.VetAff = ""; this.CordID = ""; this.ADTPlsNum = "";
  if (PIDCount > 0) {
    //Logger(DBG_PROCESS,"PIDCount: " + PIDCount);
    for (var i = 0; i < PIDCount; i++) {
      //'Get the current message Kestral UrNumber from PID-3 and if multiples ID's find the MR (MaterURNO) type and Medicare
      //if (m.element("PID-3").Defined && m.element("PID-3").AsString != "")
      if ((m.Segment("PID", i).Element("3-1").defined) && (m.Segment("PID", i).Element("3-1").AsString != "")) {
        //Logger(DBG_PROCESS,"PID 3 defined and not nothing");
        //'always run loop regardless wether repeats or not
        if ((m.Segment("PID", i).Field(3).RepeatCount) >= 1)   //'Repeats are for 1 or more
        {
          //if (m.Segment("PID",i).Field(3).ActiveComponentCount > 1) If first repeat has a component 5 then go through all repaeats
          if ((m.Segment("PID", i).Field(3).Repeats(0).Component(5).Defined) && ((m.Segment("PID", i).Field(3).Repeats(0).Component(5) != null) || (m.Segment("PID", i).Field(3).Repeats(0).Component(5).AsString != ""))) {
            for (var j = 0; j <= ((m.Segment("PID", i).Field(3).RepeatCount) - 1); j++) {
              //Logger(DBG_PROCESS,"i/j " + i + "/" + j);
              var IdTypeCode = m.Segment("PID", i).Field(3).Repeats(j).Component(5).AsString;
              //Logger(DBG_PROCESS,"idTypeCode: " + IdTypeCode);
              //Hospital MRN/URNO
              if ((m.Segment("PID", i).Field(3).Repeats(j).Component(5).AsString).toUpperCase() == "MR") {
                //If an ADT incoming message has Surname/Firstname as below set Mater Urno:0000001
                //if (((UCase(vSurname) = "UPGRADE") and (UCase(vFirstname) = "UPGRADE")) or ((UCase(vSurname) = "OUTAGE") and (UCase(vFirstname) = "OUTAGE"))) then
                if (((m.Segment("PID", i).Element("5-1").AsString == "UPGRADE") && (m.Segment("PID", i).Element("5-2").AsString == "UPGRADE")) || ((m.Segment("PID", i).Element("5-1").AsString == "OUTAGE") && (m.Segment("PID", i).Element("5-2").AsString == "OUTAGE"))) {
                  this.Urno = vMaterURNO;
                  m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString = "0000001"
                }
                else {
                  //Logger(DBG_PROCESS,"Mater URNO found");
                  var vMaterURNO = m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString;
                  //Logger(DBG_PROCESS,"Mater URNO found: " + vMaterURNO);
                  vMaterURNO = vMaterURNO.replace("'", "");                                                //' Convert apostrophe for Urno
                  this.Urno = vMaterURNO;
                }
              }
              //PLS Patient Key
              if ((m.Segment("PID", i).Field(3).Repeats(j).Component(5).AsString).toUpperCase() == "PI") {
                //Logger(DBG_PROCESS,"PLSPatNum found");
                var vPLSPatNum = m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString;
                this.PlsNum = vPLSPatNum;
                //if (((m.Segment("PID",i).Field(3).Repeats(j).Component(5).AsString).toUpperCase() == "PI") &&  ((((m.Segment("PID",i).Field(4).Repeats(j).Component(4-3).AsString).toUpperCase() == "MLS") || ((m.Segment("PID",i).Field(4).Repeats(j).Component(4-3).AsString).toUpperCase() == "MATER PATHOLOGY")) && ((m.Segment("PID",i).Field(4).Repeats(j).Component(4-4).AsString).toUpperCase() == "2623")))
                //if (((m.Segment("PID",i).Field(4).Repeats(j).Component(4-3).AsString.toUpperCase() == "MLS") || (m.Segment("PID",i).Field(4).Repeats(j).Component(4-3.AsString).toUpperCase() == "MATER PATHOLOGY")) && (m.Segment("PID",i).Field(4).Repeats(j).Component(4-4).AsString.toUpperCase() == "2623"))
                if ((((m.Segment("PID", i).Field(3).Repeats(j).Component(4).SubComponent(1).AsString.toUpperCase() == "MLS") || (m.Segment("PID", i).Field(3).Repeats(j).Component(4).SubComponent(1).AsString.toUpperCase() == "MATER PATHOLOGY")) && (m.Segment("PID", i).Field(3).Repeats(j).Component(4).SubComponent(2).AsString.toUpperCase() == "2623"))) {
                  var vADTPatNum = m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString;
                  this.ADTPlsNum = vADTPatNum;
                }
              }
              //Hospital Medicare entry date stamped from multiple possibilities
              if ((m.Segment("PID", i).Field(3).Repeats(j).Component(5).AsString).toUpperCase() == "MC") {
                if (m.Segment("PID", i).Field(3).Repeats(j).Component(7) != null)
                //if (m.Segment("PID",i).Field(3).Repeats(j).Component(7).Defined)
                {
                  var MCStartDate = m.Segment("PID", i).Field(3).Repeats(j).Component(7).AsDateTime.FormatTimeStamp("dd/mm/yyyy");
                  //'alert("Start Date found " & MCStartDate)
                }
                if (m.Segment("PID", i).Field(3).Repeats(j).Component(8) != null)
                //if (m.Segment("PID",i).Field(3).Repeats(j).Component(8).Defined)
                {
                  var MCExpiryDate = m.Segment("PID", i).Field(3).Repeats(j).Component(8).AsDateTime.FormatTimeStamp("dd/mm/yyyy");
                  //'alert("Start Date found " & MCStartDate)
                }
                if (!m.Segment("PID", i).Field(3).Repeats(j).Component(8) != null) {
                  var vMedicare = m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString;
                  this.Medicare = vMedicare;
                  //'alert vMedicare,,"Current Medicare Number1 (Not Expired)"
                  m.Segment("PID", i).Field(19).AsString = vMedicare;
                }
                else {
                  //var DateTimeNow = HL7Connect_Now.FormatTimeStamp("dd/mm/yyyy");
                  if (diffDate(MCExpiryDate, HL7Connect_Now.FormatTimeStamp("dd/mm/yyyy")) >= 1) {
                    var vMedicare = m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString;
                    this.Medicare = vMedicare;
                    //'alert vMedicare,,"Current Medicare Number1 (Not Expired)"
                    m.Segment("PID", i).Field(19).AsString = vMedicare;
                  }
                }
                //Logger(DBG_PROCESS,"PLS Medicare Number found");
                //var vMedicare = m.Segment("PID",i).Field(3).Repeats(j).Component(1).AsString;
                //this.Medicare = vMedicare;
              }
              if ((m.Segment("PID", i).Field(3).Repeats(j).Component(5).AsString).toUpperCase() == "DV") {
                if (m.Segment("PID", i).Field(3).Repeats(j).Component(7) != null) {
                  var DVStartDate = m.Segment("PID", i).Field(3).Repeats(j).Component(7).AsDateTime.FormatTimeStamp("dd/mm/yyyy");
                  //'alert("Start Date found " & MCStartDate)
                }
                if (m.Segment("PID", i).Field(3).Repeats(j).Component(8) != null) {
                  var DVExpiryDate = m.Segment("PID", i).Field(3).Repeats(j).Component(8).AsDateTime.FormatTimeStamp("dd/mm/yyyy");
                  //'alert("Start Date found " & MCStartDate)
                }
                if (!m.Segment("PID", i).Field(3).Repeats(j).Component(8) != null) {
                  var vVetAffNumber = m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString;
                  this.VetAffNumber = vVetAffNumber;
                  //'alert vMedicare,,"Current Medicare Number1 (Not Expired)"
                  m.Segment("PID", i).Field(19).AsString = vVetAffNumber;
                }
                else {
                  //var DateTimeNow = HL7Connect_Now.FormatTimeStamp("dd/mm/yyyy");
                  if (diffDate(DVExpiryDate, HL7Connect_Now.FormatTimeStamp("dd/mm/yyyy")) >= 1) {
                    var vVetAffNumber = m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString;
                    this.VetAffNumber = vVetAffNumber;
                    //'alert vMedicare,,"Current Medicare Number1 (Not Expired)"
                    m.Segment("PID", i).Field(19).AsString = vVetAffNumber;
                  }
                }
                //Logger(DBG_PROCESS,"PLS Medicare Number found");
                //var vMedicare = m.Segment("PID",i).Field(3).Repeats(j).Component(1).AsString;
                //this.Medicare = vMedicare;
              }
              if ((m.Segment("PID", i).Field(3).Repeats(j).Component(5).AsString).toUpperCase() == "VA") {
                //Logger(DBG_PROCESS,"PLS Veterans Affair found");
                //this.VA = m.Segment("PID",i).Field(3).Repeats(j).Component(1).AsString;
                var vVA = m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString;
                this.VettAff = vVA;
              }
              if ((m.Segment("PID", i).Field(3).Repeats(j).Component(5).AsString).toUpperCase() == "XX") {
                if ((m.Segment("PID", i).Field(3).Repeats(j).Component(4).SubComponent(1).AsString == "AUSCORD") && (m.Segment("PID", i).Field(3).Repeats(j).Component(4).SubComponent(2).AsString == "QLDCORD")) {
                  var CordID = m.Segment("PID", i).Field(3).Repeats(j).Component(1).AsString;
                  this.CordID = CordID;
                }
              }
            }
          }
          else {
            //Assume only a Mater URNO provided. This may not be true, perhaps we get the PLSNum here if no Mater URNO available.
            var vMaterID = m.Segment("PID", i).Field(3).Component(1).AsString;
            if (m.Segment("PID", i).Field(3).Component(1).AsString != m.Segment("PID", i).Field(4).Component(1).AsString) {
              var vMaterURNO = m.Segment("PID", i).Field(3).Component(1).AsString;
              //Logger(DBG_PROCESS,"Mater URNO found: " + vMaterURNO);
            }
            else {
              var vMaterURNO = "";
              //Logger(DBG_PROCESS,"Mater URNO not found");
            }
            this.Urno = vMaterURNO.replace("'", "");                                                  //' Convert apostrophe for Urno;
          }
        }
      }
    }
  }
}

//
// function : PatientTL
// purpose : Constructor for Patient Telecommunications class
// return : PatientTL object
//
function patientTL(m, HomePhone, Mobile, HomeFax, WorkPhone, WorkFax, WorkMobile) {
  var PIDCount = m.CountSegment("PID");
  //var DateTimeNow = HL7Connect_Now.FormatTimeStamp("dd/mm/yyyy");
  this.HomePhone = ""; this.Mobile = ""; this.HomeFax = ""; this.WorkPhone = ""; this.WorkFax = ""; this.WorkMobile = "";
  if (PIDCount > 0) {
    for (var i = 0; i < PIDCount; i++) {
      //'Get the current private telecommunications details
      if ((m.Segment("PID", i).Element("13-1").defined) && (m.Segment("PID", i).Element("13-1").AsString != "")) {
        //'always run loop regardless wether repeats or not
        if ((m.Segment("PID", i).Field(13).RepeatCount) >= 1)   //'Repeats are for One or more
        {
          //if ((m.Segment("PID",i).Field(13).Repeats(0).Component(5).Defined) && ((m.Segment("PID",i).Field(3).Repeats(0).Component(5)!=null) || (m.Segment("PID",i).Field(3).Repeats(0).Component(5).AsString != "")))
          for (var j = 0; j <= ((m.Segment("PID", i).Field(13).RepeatCount) - 1); j++) {
            var UseCode = m.Segment("PID", i).Field(13).Repeats(j).Component(2).AsString;
            //Primary residence telecommunications
            if ((m.Segment("PID", i).Field(13).Repeats(j).Component(2).AsString).toUpperCase() == "PRN") {
              if ((m.Segment("PID", i).Field(13).Repeats(j).Component(3).AsString).toUpperCase() == "PH") {
                var HomePhone = m.Segment("PID", i).Field(13).Repeats(j).Component(1).AsString;
                HomePhone = HomePhone.replace(" ", "");                                                //' Convert spaces for Home Phone Number
                HomePhone = HomePhone.replace("'", "''");                                              //' Convert apostrophe for Home Phone Number
                this.HomePhone = HomePhone;
              }
              if ((m.Segment("PID", i).Field(13).Repeats(j).Component(3).AsString).toUpperCase() == "CP") {
                var Mobile = m.Segment("PID", i).Field(13).Repeats(j).Component(1).AsString;
                Mobile = Mobile.replace(" ", "");                                                    //' Convert spaces for Private Mobile
                Mobile = Mobile.replace("'", "''");                                                  //' Convert apostrophe for Private Mobile Number
                this.Mobile = Mobile;
              }
              if ((m.Segment("PID", i).Field(13).Repeats(j).Component(3).AsString).toUpperCase() == "FX") {
                var HomeFax = m.Segment("PID", i).Field(13).Repeats(j).Component(1).AsString;
                HomeFax = HomeFax.replace(" ", "");                                                //' Convert spaces for Home Fax Number
                HomeFax = HomeFax.replace("'", "''");                                              //' Convert apostrophe for Home Fax Number
                this.HomeFax = HomeFax;
              }
            }
          }
        }//if Repeats for PID 13
      }//if PID 13
      //'Get the current business telecommunications details
      if ((m.Segment("PID", i).Element("14-1").defined) && (m.Segment("PID", i).Element("14-1").AsString != "")) {
        //'always run loop regardless wether repeats or not
        if ((m.Segment("PID", i).Field(14).RepeatCount) >= 1)   //'Repeats are for One or more
        {
          for (var j = 0; j <= ((m.Segment("PID", i).Field(14).RepeatCount) - 1); j++) {
            var UseCode = m.Segment("PID", i).Field(14).Repeats(j).Component(2).AsString;
            //Work Place telecommunications
            if ((m.Segment("PID", i).Field(14).Repeats(j).Component(2).AsString).toUpperCase() == "WPN") {
              if ((m.Segment("PID", i).Field(14).Repeats(j).Component(3).AsString).toUpperCase() == "PH") {
                var WorkPhone = m.Segment("PID", i).Field(14).Repeats(j).Component(1).AsString;
                WorkPhone = WorkPhone.replace(" ", "");                                                //' Convert spaces for Work Phone Number
                WorkPhone = WorkPhone.replace("'", "''");                                              //' Convert apostrophe for Work Phone Number
                this.WorkPhone = WorkPhone;
              }
              if ((m.Segment("PID", i).Field(14).Repeats(j).Component(3).AsString).toUpperCase() == "CP") {
                var WorkMobile = m.Segment("PID", i).Field(14).Repeats(j).Component(1).AsString;
                WorkMobile = WorkMobile.replace(" ", "");                                                    //' Convert spaces for Work Mobile
                WorkMobile = WorkMobile.replace("'", "''");                                                  //' Convert apostrophe for Work Mobile
                this.WorkMobile = WorkMobile;
              }
              if ((m.Segment("PID", i).Field(14).Repeats(j).Component(3).AsString).toUpperCase() == "FX") {
                var WorkFax = m.Segment("PID", i).Field(14).Repeats(j).Component(1).AsString;
                WorkFax = WorkFax.replace(" ", "");                                                //' Convert spaces for Work Fax Number
                WorkFax = WorkFax.replace("'", "''");                                              //' Convert apostrophe for Work Fax Number
                this.WorkFax = WorkFax;
              }
            }//if WPN
          }
        }//if Repeats for PID 14
      }//if PID 14
    }//for PIDCount
  }//if PIDCount
}

//
// function : hl7DataToString
// purpose  : display an hl7message object Data as a string
//
function hl7DataToString() {
  return "SMsgID: " + this.MsgID + "\t" +
    "Message Event: " + this.Event + "\t" +
    "Message Type: " + this.MsgType + "\t" +
    "Order Type: " + this.OType + "\t" +
    "Patient Number: " + this.PatID.PlsNum + "\t" +
    "Patient Episode URNO: " + this.PatID.Urno + "\t" +
    "Patient Title: " + this.Title + "\t" +
    "Surname: " + this.Surname + "\t" +
    "Given: " + this.Given + "\t" +
    "Middle: " + this.Middle + "\t" +
    "sDOB: " + this.sDOB + "\t" +
    "vDOB: " + this.vDOB + "\t" +
    "Address1: " + this.Add1 + "\t" +
    "Address2: " + this.Add2 + "\t" +
    "Suburb: " + this.Sub + "\t" +
    "Post Code: " + this.PCode + "\t" +
    "Req Number: " + this.ReqNum + "\t" +
    "Medicare Number: " + this.PatID.Medicare + "\t" +
    "VA Number: " + this.PatID.VettAff + "\t" +
    "Sex: " + this.Sex + "\t" +
    "Collect: " + this.Col + "\t" +
    "Unit: " + this.Unit + "\t" +
    "Col Date: " + this.CDate + "\t" +
    "Col Time: " + this.CTime + "\t" +
    "Req Date: " + this.RDate + "\t" +
    "Req Time: " + this.RTime + "\t" +
    "Date Added: " + this.DAdded + "\t" +
    "Time Added: " + this.TAdded + "\t" +
    "WAdded: " + this.WAdded + "\t" +
    "Hospital: " + this.Hosp + "\t" +
    "Ward: " + this.Wrd + "\t" +
    "RequestDoc: " + this.Rqd + "\t" +
    "ResponsibleDoc: " + this.Rsd + "\t" +
    "CopyDocList: " + this.Cds + "\t" +
    "TestList: " + this.Tsts + "\t" +
    "TotalBillCode: " + this.BDets.TBill + "\t" +
    "BillCode: " + this.BDets.BCode + "\t" +
    "AltDebtor: " + this.BDets.ADebt + "\t" +
    "BillType: " + this.BDets.BType + "\t" +
    "PatCond: " + this.PatCond + "\t" +
    "ScanDepPrtList: " + this.ScanList;
}


//
// function : validateMessage
// purpose  : to return an error if we have not got a properly formed HL7 Message
// Return   : String Returned
//
function validateMessage(m) {
  alert("I am in ValidateMessage");
  var MSHCount = 0, PIDCount = 0, ORCCount = 0, OBRCount = 0, OBXCount = 0;
  var i, j;
  var seg, elem;
  var MsgType = m.MessageType;
  var EventType = m.Event;
  MSHCount = m.CountSegment("MSH")
  PIDCount = m.CountSegment("PID")
  PV1Count = m.CountSegment("PV1")
  ORCCount = m.CountSegment("ORC")
  OBRCount = m.CountSegment("OBR")
  OBXCount = m.CountSegment("OBX")
  if ((MsgType == "ORM") && (EventType == "O01")) {
    for (i = 0; i < ORCCount; i++) {
      elem = m.Segment("ORC", i).Element("1").AsString;
      //Kernel.WriteToLog(DBG_WARNING,elem);
      if ((elem != "OC") && ((MSHCount != 1) || (PIDCount != 1) || (PV1Count != 1) || (ORCCount < 1) || (OBRCount < 1))) {
        throw new Error("Validation Failure");
      }
      else {
        return (true);
      }
    }
  }
}

Array.prototype.contains = function (obj) {
  var i = this.length;
  while (i--) {
    if (this[i] == obj) {
      return true;
    }
  }
  return false;
}

Array.prototype.InitArray = function () {
  for (i = 0; i < this.length; i++) {
    this[i] = "";
  }
}

String.prototype.remquote = function () {
  // Use a regular expression to replace double quotes with single quote
  //var rx = /\''/g
  //this.replace(rx,"'");
  //this.replace("\''", "'");
  this.replace("/\''/g", "'");
}

function ValidSqlSmallDateTime(dte) {
  currDate = new Date(dte.Year, dte.Month, dte.Day, dte.Hour, dte.Minute, dte.Second);
  //currDate = dte;
  var dateMin = new Date(1900, 01, 01, 00, 00, 00);
  var dateMax = new Date(2079, 06, 06, 23, 59, 00);
  if ((currDate >= dateMin) && (currDate <= dateMax)) {
    alert('in range');
    return (true);
  }
  else {
    alert('out of range!');
    return (false);
  }
}

//
// function : PatientMatchHL7ToDB
// purpose  : To return boolean for a match between the HL7 Data details for the Patient and what is recorded in the PLS SQL DB PLSData.tblPLS_Pat
//            Default return to "true" unless a demographic does not match then set to False.
// Return   : Boolean Returned
//            "true": means no mismatched demographic between the HL7 Message and the PLS SQL Pat table so store message details in the PatUpdates SQL Table.
//            "false": means demographics do not match so allow a route to iPM but do not store details in SQL and so no return Update to PLS will be allowed.
//
function PatientMatchHL7ToDB(HL7Data, Pat) {
  var matchFound = true;
  if (Pat.fnd.toUpperCase() == "DEFAULTPATIENT") {
    var patdob = TDateAndTime();
    patdob.ReadDate('yyyy-mm-dd', Pat.dob);
    var Dob = patdob.FormatTimeStamp("ddmmyyyy");
    patdob = null;
  }
  else {
    var Dob = Pat.oDob.FormatTimeStamp("ddmmyyyy");
  }
  //var DBPat = new Array(Pat.surname,Pat.givenName,Pat.sex,Dob,Pat.address1,Pat.address2,Pat.city,Pat.postcode);
  //var HL7Pat = new Array(HL7Data.Surname,HL7Data.Given,HL7Data.Sex,HL7Data.oDob.FormatTimeStamp("ddmmyyyy"),HL7Data.Add[0][0],HL7Data.Add[0][1],HL7Data.Add[0][2],HL7Data.Add[0][4]);
  var DBPat = new Array(Pat.surname, Pat.givenName, Pat.sex, Dob);
  var HL7Pat = new Array(HL7Data.Surname.replace(new RegExp("\''", "gi"), "'"), HL7Data.Given.replace(new RegExp("\''", "gi"), "'"), HL7Data.Sex, HL7Data.oDob.FormatTimeStamp("ddmmyyyy"));
  for (var i = 0; i < DBPat.length; i++) {
    if (DBPat[i] != HL7Pat[i]) {
      matchFound = false;
    }
  }
  return (matchFound);
}

//
// StoreADTPatUpdateDetails
// purpose : To build the SQL requirments and then call the SQL ADD/UPDATE/DELETE method,
//           for the ADT A28/A31 message requests to iPM for URNO/Details. A29 also Possible??
// return  : void
function StoreADTPatUpdateDetails(aEvent, m, dbase, tbl, HL7Data) {
  var wList = ""; var fieldList = ""; var resultList = ""; var updateList = "";
  var matID = "Mater";
  var otherName = "";
  //New single table setup run in tandem
  wList = "tblPLS_PatUpdates.PLSID) = '" + HL7Data.PLSNum + "'";
  fieldList = "PLSID,PMI_URNO,PMI_FamilyName,PMI_GivenName,PMI_OtherName,PMI_Sex,PMI_DOB,PMI_MedicareNo,IDTypeCode";
  resultList = "'" + HL7Data.PatID.PlsNum + "','" + HL7Data.PatID.Urno + "','" + HL7Data.Surname + "','" + HL7Data.Given + "','" + otherName + "','" + HL7Data.Sex + "','" + HL7Data.oDob.FormatTimeStamp("yyyy/mm/dd") + "','" + HL7Data.PatID.Medicare + "','" + matID + "'";
  updateList = "PLSID='" + HL7Data.PatID.PlsNum + "',PMI_URNO='" + HL7Data.PatID.Urno + "',PMI_FamilyName='" + HL7Data.Surname + "',PMI_GivenName='" + HL7Data.Given + "',PMI_OtherName='" + otherName + "',PMI_Sex='" + HL7Data.Sex + "',PMI_DOB='" + HL7Data.oDob.FormatTimeStamp("yyyy/mm/dd") + "',PMI_MedicareNo='" + HL7Data.PatID.Medicare + "',IDTypeCode='" + matID + "'";
  ProcSQLData(dbase, tbl, HL7Data, wList, fieldList, resultList, updateList, "SC", "false");
  wList = ""; fieldList = ""; resultList = ""; updateList = "";
}