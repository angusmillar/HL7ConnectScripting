<%include $script$\MaterLib.js%>
<%include $script$\SQLLib.js%>
<%include $script$\DBaseLib.js%>

function Main(aEvent)
{
  Breakpoint;
  alert("MAIN Function in ADT Modify Script is processing");
  Logger(DBG_PROCESS,"","","","Running the New ADT_iPM Javascript Modify function");
  //Logger(DBG_ERROR,"ADT_IPM_Modify","john.carey@mater.org.au","HL7ConnectGW5@mater.org.au","Running the New ADT_iPM Javascript Modify function");
  var hm = aEvent.message;
  var m = aEvent.message.hl7;
  //Logger(DBG_ANNOUNCE,"HL7Connect Pathology ADT Ready to process Message","john.carey@mater.org.au","HL7Connect@mater.org.au",m.source);
  var SegNum = m.SegmentCount;
  var SMsgID = m.MsgID;
  var SMsgType = m.MessageType;
  var SMsgEvent = m.Event;
  if (SMsgType != "ADT")
  {
    Logger(DBG_WARNING,"","","","A non ADT Modify Script message for processing so Exit - SMsgID: " + SMsgID);
    return;
  }
  else
  {
    if ((SMsgType == "MFN") || (SMsgType == "SIU"))
    {
      Logger(DBG_WARNING,"","","","ADT Modify Script HL7 Message not to be processed - SMsgID: " + SMsgID);
      return;
    }
  }
  Logger(DBG_PROCESS,"","","","Read the HL7 Message and create a new HL7Data Object for processing");
  var HL7Data = new hl7data(m);
  Logger(DBG_PROCESS,"","","","Newly returned HL7Data object values: " + HL7Data.MsgID + "/" + HL7Data.PatID.Urno + "/" + HL7Data.Event);
  //Update the Message before it goes out to PLS for specific requirements from iPM raw message.
  ADTUpdateForPLS(m,HL7Data);
  //Get the server DB to apply data
  var dbName = getServerName();
  switch (true)
  {
    case ((SMsgEvent == "A01") || (SMsgEvent == "A02") || (SMsgEvent == "A03") || (SMsgEvent == "A04") || (SMsgEvent == "A05") || (SMsgEvent == "A08") || (SMsgEvent == "A13")):
    {
      //Event with possible IN1 segments so reprocess for final form to PLS.
      ProcMessage(m,HL7Data,dbName);
      break;
    }
    case ((SMsgEvent == "A13") || (SMsgEvent == "A14") || (SMsgEvent == "A28") || (SMsgEvent == "A31")):
    {
      //Event with possible IN1 segments so reprocess for final form to PLS.
      ProcMessage(m,HL7Data,dbName);
      break;
    }
    case ((SMsgEvent == "A11") || (SMsgEvent == "A12") || (SMsgEvent == "A21") || (SMsgEvent == "A22") || (SMsgEvent == "A27") || (SMsgEvent == "A29") || (SMsgEvent == "A34")):
    {
      DropHL7Segments(m,"IN1",m.MsgID,m.Event);
      break;
    }
    case ((SMsgEvent == "A38") || (SMsgEvent == "A45") || (SMsgEvent == "A52") || (SMsgEvent == "A54") || (SMsgEvent == "A55")):
    {
      DropHL7Segments(m,"IN1",m.MsgID,m.Event);
      break;
    }
    default:
    {
      DropHL7Segments(m,"IN1",m.MsgID,m.Event);
      break;
    }
  }
  HL7Data = null;
  hm = null;
  m = null;
  return;
}

function ProcMessage(m,HL7Data,dbName)
{
  var IN1Count = m.CountSegment("IN1");
  //'If I have a message defined to process that has one or more IN1 segment/s then check if I have had a previous Host Inpatient Episode message.
  //'If no IN1 segments in message then just send to PLS with no modification
  if (IN1Count > 0)
  {
    //Get DB connections
    //var db = Kernel.GetDB(dbName);          //' get a handle to the global database pool
    //var con = db.GetConnection(dbName);     //' get an actual connection to the database
    //'If IN1 segments are present then determine if there has been a Host Episode registered against the Host Patient
    //'Get the current Insurer Code from the Key for later
    //var HostEpeInsCode = db.Lookup("tblHostInsurer","HostInsKey",HostEpeInsKey,"InsuranceCode","")
    //db = null;
    if (HostEpisodeCount(HL7Data,dbName) == 0)
    {
      //'alert("Drop all IN1 Segments from Message");
      m.DropSegments("IN1");
    }
    else
    {
      //return;
      //'If we have host Episodes registered then determine if there is a current Inpatient host Episode.
      if (HostEpisodeCurrent(HL7Data,dbName) >= 1)
      {
        //'alert("Delete all but the current IN1 code");
        //'Get the current Admit Episode Insurance Key
        var HostEpeInsKey = HostEpeCurrentInsurer(HL7Data,dbName);
        if (HostEpeInsKey != 0)
        {
          //'alert("Get the Insurer Code for the displayed Key");
          //'Get the current Insurer Code from the Key
          var db1 = Kernel.GetDB(dbName);          //' get a handle to the global database pool
          var HostEpeInsCode = db1.Lookup("tblHostInsurer","HostInsKey",HostEpeInsKey,"InsuranceCode","")
          db1 = null;
          //'alert("HostEpeInsCode");
          if (HostEpeInsCode != "")
          {
            DeleteIN1Segments(m,HL7Data,HostEpeInsCode)
          } //end if
          else
          {
            m.DropSegments("IN1")
          } //end if
        }
        else
        {
          //'If there was no current inpatient host episode then determine if a past inpatient discharged host episode in the last 12 months.
          if (HostEpisodeDischargedCurrent(HL7Data,dbName) >= 1)
          {
            //'alert("Delete all other IN1 except current discharged code");
            //'Get the current last Discharged Insurance Key
            var HostEpeDschInsKey = HostEpeDischargedInsurer(HL7Data,dbName);
            if (HostEpeDschInsKey != 0)
            {
              //'alert("Get the Insurer Code for the displayed Key");
              //'Get the current Insurer Code from the Key
              var db2 = Kernel.GetDB(dbName);          //' get a handle to the global database pool
              HostEpeInsCode = db2.Lookup("tblHostInsurer","HostInsKey",HostEpeDschInsKey,"InsuranceCode","")
              db2 = null;
              //'alert("HostEpeInsCode");
              if (HostEpeInsCode != "")
              {
                DeleteIN1Segments(m,HL7Data,HostEpeInsCode);
              }//end if
            }
            else
            {
              Logger(DBG_WARNING,"ADT_IPM_Modify","john.carey@mater.org.au","HL7ConnectGW5@mater.org.au","Discharged Host Episode with no HostInsKey in Table");
              m.DropSegments("IN1");
            }//end if
          }
          else
          {
            //'No Host Episode current or discharged previous so delete all IN1 segments
            //'alert("Drop All IN1 Segments");
            if (IN1Count != 1) m.DropSegments("IN1");
          }//end if
        }//end if HostEpeInsKey != 0
      } //end if HosteEpisodeCurrent >= 1
    }//end HostEpisodeCount else
    if ((HostEpeInsCode != "") && (m.Segment("PV1",0).Element("20").defined) && (m.Segment("PV1",0).Element("20").AsString != ""))
    {
      m.Segment("PV1",0).Element("20").AsString = HostEpeInsCode;  //'Financial Class changed to IN1 fund code
    }
    //db = null;
  }//end if IN1count > 0
}

function DropHL7Segments(m,seg,MsgID,Event)
{
  if (m.SegmentCount(seg) > 0)
  {
    //'Drop all IN1 segments that are present and Email notify John Carey
    m.DropSegments(seg)
    Logger(DBG_WARNING,"ADT Message Modify Script Alert","john.carey@mater.org.au","HL7ConnectGW5@mater.org.au","Please review defined ADT Modify Script HL7 message with IN1 segments dropped - SMsgID/SMsgEvent: " + MsgID + "/" + Event);
    //Logger(DBG_WARNING,"ADT Message Modify Alert","john.carey@mater.org.au","HL7ConnectGW5@mater.org.au","ADT Message not defined for Modify script - SMsgID/SMsgEvent: " + m.MsgID + "/" + m.Event);
  }
  return;
}

function HostEpisodeCount(HL7Data,dbName)
{
  var db = Kernel.GetDB(dbName);          //' get a handle to the global database pool
  var con = db.GetConnection(dbName);     //' get an actual connection to the database
  var HostEpeCount = con.CountSQL("SELECT COUNT(tblHostEpe.HostPidKey) FROM tblHostEpe INNER JOIN tblHostPID ON tblHostEpe.HostPidKey = tblHostPID.HostPidKey WHERE (tblHostEpe.HostPidKey IN (SELECT HostPidKey FROM tblHostPID AS HPIDKey WHERE (InternalID = '" + HL7Data.PatID.Urno + "')))");
  con.Terminate;
  db.YieldConnection(con,'');
  con = null;
  db = null;
  return(HostEpeCount);
}

function HostEpisodeCurrent(HL7Data,dbName)
{
  var db = Kernel.GetDB(dbName);          //' get a handle to the global database pool
  var con = db.GetConnection(dbName);     //' get an actual connection to the database
  var HostEpeCurrent = con.CountSQL("SELECT COUNT(tblHostEpe.HostPidKey) AS HostEpeCurrent, MAX(tblHostEpe.HostAdmitDateTime) AS LatestAdmitDateTime FROM tblHostEpe INNER JOIN tblHostPID ON tblHostEpe.HostPidKey = tblHostPID.HostPidKey WHERE (tblHostEpe.HostPidKey IN (SELECT HostPidKey FROM tblHostPID AS HPIDKey WHERE (InternalID = '" + HL7Data.PatID.Urno + "'))) AND (tblHostEpe.HostPatientClass = '" + "I" + "') AND (tblHostEpe.HostDischargeDateTime = '') ORDER BY LatestAdmitDateTime DESC");
  con.Terminate;
  db.YieldConnection(con,'');
  con = null;
  db = null;
  return(HostEpeCurrent);
}

function HostEpisodeDischargedCurrent(HL7Data,dbName)
{
  var db = Kernel.GetDB(dbName);          //' get a handle to the global database pool
  var con = db.GetConnection(dbName);     //' get an actual connection to the database
  var HostEpeDschCurrent = con.CountSQL("SELECT COUNT(tblHostEpe.HostPidKey) AS HostEpeDschCurrent, MAX(tblHostEpe.HostAdmitDateTime) AS LatestAdmitDateTime FROM tblHostEpe INNER JOIN tblHostPID ON tblHostEpe.HostPidKey = tblHostPID.HostPidKey WHERE (tblHostEpe.HostPidKey IN (SELECT HostPidKey FROM tblHostPID AS HPIDKey WHERE (InternalID = '" + HL7Data.PatID.Urno + "'))) AND (tblHostEpe.HostPatientClass = '" + "I" + "') AND (tblHostEpe.HostDischargeDateTime <> '') ORDER BY LatestAdmitDateTime DESC")
  con.Terminate;
  db.YieldConnection(con,'');
  con = null;
  db = null;
  return(HostEpeDschCurrent);
}

function HostEpeCurrentInsurer(HL7Data,dbName)
{
  //'alert("HostEpeCurrentInsurer Function");
  //'Select the InsuranceKeyvalue
  var db = Kernel.GetDB(dbName);          //' get a handle to the global database pool
  var con = db.GetConnection(dbName);     //' get an actual connection to the database
  con.sql = "SELECT tblHostEpe.HostPidKey, MAX(tblHostEpe.HostAdmitDateTime) AS LatestAdmitDateTime, tblHostEpe.HostInsKey FROM tblHostEpe INNER JOIN tblHostPID ON tblHostEpe.HostPidKey = tblHostPID.HostPidKey WHERE (tblHostEpe.HostPidKey IN (SELECT HostPidKey FROM tblHostPID AS HPIDKey WHERE (InternalID = '" + HL7Data.PatID.Urno + "'))) AND (tblHostEpe.HostPatientClass = '" + "I" + "') AND (tblHostEpe.HostDischargeDateTime = '') GROUP BY tblHostEpe.HostInsKey, tblHostEpe.HostPidKey ORDER BY LatestAdmitDateTime DESC";
  con.prepare;
  con.execute;
  if (con.fetchnext)     //'Get value if found
  {
    var HostEpeInsKey = con.ColIntegerByName("HostInsKey");
  }
  else
  {
    var HostEpeInsKey = 0;
  }
  con.Terminate;
  db.YieldConnection(con,'');
  con = null;
  db = null;
  return(HostEpeInsKey);
}

function HostEpeDischargedInsurer(HL7Data,dbName)
{
  //'alert("HostEpeCurrentInsurer Function");
  //'Select the InsuranceKeyvalue
  var db = Kernel.GetDB(dbName);          //' get a handle to the global database pool
  var con = db.GetConnection(dbName);     //' get an actual connection to the database
  con.sql = "SELECT tblHostEpe.HostPidKey, MAX(tblHostEpe.HostAdmitDateTime) AS LatestAdmitDateTime, tblHostEpe.HostInsKey FROM tblHostEpe INNER JOIN tblHostPID ON tblHostEpe.HostPidKey = tblHostPID.HostPidKey WHERE (tblHostEpe.HostPidKey IN (SELECT HostPidKey FROM tblHostPID AS HPIDKey WHERE (InternalID = '" + HL7Data.PatID.Urno + "'))) AND (tblHostEpe.HostPatientClass = '" + "I" + "') AND (tblHostEpe.HostDischargeDateTime <> '') GROUP BY tblHostEpe.HostInsKey, tblHostEpe.HostPidKey ORDER BY LatestAdmitDateTime DESC";
  con.prepare;
  con.execute;
  if (con.fetchnext)     //'Get value if found
  {
    var HostEpeDschInsKey = con.ColIntegerByName("HostInsKey");
  }
  else
  {
    var HostEpeDschInsKey = 0;
  }
  con.Terminate;
  db.YieldConnection(con,'');
  con = null;
  db = null;
  return(HostEpeDschInsKey);
}

function DeleteIN1Segments(m,HL7Data,HostEpeInsCode)
{
  var IN1Index = 0;
  var CurrentIN1Count = m.CountSegment("IN1");
  if (CurrentIN1Count > 0)
  {
    do 
    {
      m.Segment("IN1",IN1Index).Element("1").AsString = IN1Index + 1;
      if ((m.Segment("IN1",IN1Index).Element("3-1").defined) && (m.Segment("IN1",IN1Index).Element("3-1").AsString != ""))
      {
        var tmp = m.Segment("IN1",IN1Index).Element("3-1").AsString;
        if (tmp != HostEpeInsCode)
        { 
          m.DeleteSegment(m.Segment("IN1",IN1Index));
          IN1Index = -1 //'Start at beggining again
          CurrentIN1Count = m.CountSegment("IN1");
        } //end if
        IN1Index = IN1Index + 1
      } //end if
    }
    while (IN1Index != CurrentIN1Count); //Loop
  } //endif
}

function ADTUpdateForPLS(m,HL7Data)
{
  var segNum = m.SegmentCount;
  for (var i=0; (i < segNum); i++)
  {
    var SegItem = m.SegmentByIndex(i).code;
    if (SegItem == "PID")
    {
      //'Change PID Address to contain only the "C" type
      if (m.SegmentByIndex(i).Element("11-3").defined)
      {
        var AddNotFinished = true;
        for (myEnum=0; myEnum<HL7Data.Add.length; myEnum++)
        {
          //Iterate multiple address details and set final address to "C" Adress Type for Mater Path if found.
          //iPM will give the required address as "C" If not found leave it as is.
          if ((HL7Data.Add[myEnum][6] == "C") && AddNotFinished)
          {
            m.SegmentByIndex(i).Element("11").ClearAll;
            m.SegmentByIndex(i).Element("11-1-1").AsString = HL7Data.Add[myEnum][0];  //PatAdd1
            m.SegmentByIndex(i).Element("11-2").AsString = HL7Data.Add[myEnum][1];    //PatAdd2
            m.SegmentByIndex(i).Element("11-3").AsString = HL7Data.Add[myEnum][2];    //Suburb
            m.SegmentByIndex(i).Element("11-4").AsString = HL7Data.Add[myEnum][3];    //State
            m.SegmentByIndex(i).Element("11-5").AsString = HL7Data.Add[myEnum][4];    //PostCode
            m.SegmentByIndex(i).Element("11-6").AsString = HL7Data.Add[myEnum][5];    //CountryCode
            m.SegmentByIndex(i).Element("11-7").AsString = HL7Data.Add[myEnum][6];    //AddType
            AddNotFinished = false;
          }
        }
      }
    }
  }
}