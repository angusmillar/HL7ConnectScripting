function OBX5Repeats(m,idx,repnum)
{
  var OBX5Repeats = "";
  for (var r=0; (r < repnum); r++)
  {
    var OBX5Repeats = OBX5Repeats + m.segmentByIndex(idx).field("5").repeats(r).AsString + " ";   //'Grab repeat.Append.
  }
  //alert("OBX5Repeats has Processed Repeats for this OBX segment: " + OBX5Repeats);
  return(OBX5Repeats);
}

function GetRes(m,idx,cntobx,repnum)
{
  if (repnum > 1)
  {                                                                         //'If greater than 0, go to OBX5Repeats
    var res = OBX5Repeats(m,idx,repnum);
    alert("HL7 OBX Result Value with Repeats",res);
  }
  else
  {
    var res = m.element("OBX:" + cntobx + "-5").AsString.toUpperCase();     //'Set res as Value
  }
  return(res);
}

function OBX5SegRepeats(m,idx,repnum)
{
  var OBX5SegRepeats = "";
  for (var r=0; (r < repnum); r++)
  {
    if (m.segment("OBX",idx).Field(2).AsString.toUpperCase() == "SN")
    {
      var res = m.segment("OBX",idx).Field("5").Repeats(r).Component(1).AsString.toUpperCase() + m.segment("OBX",idx).Field("5").Repeats(r).Component(2).AsString.toUpperCase();  //'Grab repeat. Append.
      OBX5SegRepeats = OBX5SegRepeats + res.replace(new RegExp("[\']","gi"),"''") + " ";   //'Set res as Value remove quotes for SQL
    }
    else
    {
      //OBX5SegRepeats = OBX5SegRepeats + m.segment("OBX",idx).Field(5).AsString.toUpperCase().replace(new RegExp("[\']","gi"),"''") + " ";      //'Set res as Value remove quotes for SQL
      OBX5SegRepeats = OBX5SegRepeats + m.segment("OBX",idx).Field(5).Repeats(r).AsString.toUpperCase().replace(new RegExp("[\']","gi"),"''") + " ";      //'Set res as Value remove quotes for SQL
    }
    //var OBX5SegRepeats = OBX5SegRepeats + m.segment("OBX",idx).field("5").repeats(r).AsString.replace(new RegExp("[\']","gi"),"''") + " ";   //'Grab repeat. Append.
  }
  //alert("OBX5Repeats has Processed Repeats for this OBX segment: " + OBX5Repeats);
  return(OBX5SegRepeats);
}

function GetOBXRes(m,idx)
{
  var repnum = m.segment("OBX",idx).Field("5").RepeatCount;                 //'Count number of repeats in current OBX-5
  if (repnum > 1)
  {                                                                         //'If greater than 0, go to OBX5Repeats
    var res = OBX5SegRepeats(m,idx,repnum);
    alert("HL7 OBX Result Value with Repeats",res);
  }
  else
  {
    if (m.element("OBX[" + idx + "]-2").AsString.toUpperCase() == "SN")
    {
      var res = m.element("OBX[" + idx + "]-5-1").AsString.toUpperCase() + m.element("OBX[" + idx + "]-5-2").AsString.toUpperCase()
      res = res.replace(new RegExp("[\']","gi"),"''");      //'Set res as Value remove quotes for SQL
    }
    else
    {
      var res = m.element("OBX[" + idx + "]-5").AsString.toUpperCase().replace(new RegExp("[\']","gi"),"''");      //'Set res as Value remove quotes for SQL
    }
  }
  return(res);
}

// class   : HWMCData
// purpose : Constructer for HWMCData class
// return  : Blank object returned for use.
function HWMCData(data)
{
  this.test = data[0];        //' Test Type
  this.lmo2 = data[1];        //' LMO Details
  this.perm2 = data[2];       //' Permanent
  this.edate2 = data[3];      //' End Date
  this.ldcode2 = data[4];     //' Report Doc Code
  this.pt = data[5];          //' PT
  this.inr = data[6];         //' INR
  this.cwfdose = data[7];     //' Current Dose
  this.drec = data[8];        //' New Dose
  this.ntstdt = data[9];      //' Next Test Date
  this.com = data[10];        //' Comment
  this.thr = data[11];        //' Clotting
  this.bld = data[12];        //' Bleed
  this.sick = data[13];       //' Sick
  this.meds = data[14];       //' Medication
  this.evnt = data[15];       //' Events
  this.wfdose = data[16];     //' Warf dose since last Test
  this.histcom = data[17];    //' History Comments
  this.ldcode1 = data[18];    //' Report Doc Code
  this.lmo1 = data[19];       //' LMO Details
  this.perm1 = data[20];      //' Permanent
  this.edate1 = data[21];     //' End date
  this.stinr = data[22];      //' Specific Target INR STINR
}
// ProcessHWMCData
// purpose : to build the oHwmc data object
// return the 0Txt data object populated with relevant data
function ProcessHWMCData(m,oHwmc)
{
  var cntobx=0;
  var segNum = m.SegmentCount;
  for (var i=0; (i < segNum); i++)
  {
    var SegItem = m.SegmentByIndex(i).code;
    //alert("SegItem: " + SegItem + " " + i.toString());
    if (SegItem == "OBX")
    {
      //var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      if (m.element("OBX:" + cntobx + "-3-3").AsString.toUpperCase() != "LN")
      {
        var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      }
      else
      {
        var id =  m.element("OBX:" + cntobx + "-3-4").AsString.toUpperCase();
      }
      var sts = m.element("OBX:" + cntobx + "-11").AsString.toUpperCase();
      var repnum = m.segmentByIndex(i).element("5").RepeatCount;                //'Count number of repeats in current OBX-5
      var res = GetRes(m,i,cntobx,repnum)                                       //'Set res as Value depending on repeats
      switch (id)
      {
        case "TTYPE":
            {
              oHwmc.test = res;  //'Test Type
              break;
              //'alert(Test);
            }
        case "LMO2":
            {
              oHwmc.lmo2 = res.replace(/'/g,"''");  //' LMO Details with convert for Apostrophe
              break;
              //'alert(lmo2);
            }
        case "PERM2":
            {
              oHwmc.perm2 = res.replace(/'/g,"''");  //' Permanent Convert Apostrophe for Diagnosis
              break;
              //'alert(perm2);
            }
        case "EDATE2":
            {
              var enddate2 = TDateAndTime();
              try
              {
                if (res.length == 8)
                {
                  enddate2.ReadDate('dd/mm/yy',res,true);
                }
                else
                {
                  enddate2.ReadDate('dd/mm/yyyy',res,true);
                }
                if (ValidSqlSmallDateTime(enddate2))
                {
                  oHwmc.edate2 = enddate2.AsString;    //' End Date Use Date Object from res data value for SQL date compliance issues
                }
                else
                {
                  oHwmc.edate2 = "";    //' Next Test Date not acceptable
                }
                enddate2 = null;
              }
              catch(e)
              {
                oHwmc.edate2 = "";  //' End date set to blank
              }
              break;
              //'alert(edate2);
            }
        case "DCODE2":
            {
              oHwmc.ldcode2 = res.replace(/'/g,"''");  //' Report Doc Code, Convert Apostrophe
              break;
              //'alert(ldcode2);
            }
        case "PT":
            {
              oHwmc.pt = res;  //' PT
              break;
              //'alert(pt);
            }
        case "INR":
            {
              oHwmc.inr = res;  //' INR
              break;
              //'alert(inr);
            }
        case "DOSE":
            {
              oHwmc.cwfdose = res.replace(/'/g,"''");  //' Current Dose, Convert Apostrophe
              break;
              //'alert(ldcode2);
            }
        case "NEWDSG":
            {
              oHwmc.drec = res.replace(/'/g,"''");  //' New Dose, Convert Apostrophe
              break;
              //'alert(drec);
            }
        case "NXTDTE":
            {
              var nxtdte = TDateAndTime();
              try
              {
                //Use javascript Dates instead of HL7Connect DateTime object.
                //Javascript and HL7Connect dates when set from a string do not set correctly so use below
                //ndate = new Date(res);
                //alert(res.substr(6,4)+"-"+res.substr(3,2)+"-"+res.substr(0,2));
                //ndate = new Date(res.substr(6,4), res.substr(3,2), res.substr(0,2));
                //alert("NXTDTE Date : " + ndate.toString());
                //read into date object to confirma a real date time
                //Cater for dates entry types
                if (res.length == 8)
                {
                  nxtdte.ReadDate("dd/mm/yy",res);
                }
                else
                {
                  nxtdte.ReadDate("dd/mm/yyyy",res);
                }
                //nxtdte.ReadDate("dd/mm/yyyy",res);
                alert(nxtdte.AsString);
                // Check the supplied date is sql smalldatetime valid
                if (ValidSqlSmallDateTime(nxtdte))
                {
                  //oHwmc.ntstdt = res;    //' Next Test Date
                  oHwmc.ntstdt = nxtdte.AsString;    //' Next Test Date Use Date Object from res data value for SQL date compliance issues
                }
                else
                {
                  oHwmc.ntstdt = "";    //' Next Test Date not acceptable
                }
                nxtdte = null;
              }
              catch(e)
              {
                oHwmc.ntstdt = "";     //' Next Test Date set to blank
              }
              break;
              //'alert(ntstdt);
            }
        case "CMNT":
            {
              //var re = "/'/g";
              oHwmc.com = res.replace(/'/g,"''");  //' Comment, Convert Apostrophe
              break;
              //'alert(com);
            }
        case "CLOT":
            {
              oHwmc.thr = res;  //' Clotting
              break;
              //'alert(thr);
            }
        case "BLEED":
            {
              oHwmc.bld = res;  //' Bleed
              break;
              //'alert(bld);
            }
        case "SICK":
            {
              oHwmc.sick = res.replace(/'/g,"''");  //' Sick, Convert Apostrophe
              break;
              //'alert(sick);
            }
        case "MEDS":
            {
              oHwmc.meds = res;  //' Medication
              break;
              //'alert(meds);
            }
        case "EVENT":
            {
              oHwmc.evnt = res;  //' Events
              break;
              //'alert(evnt);
            }
        case "WDOSE":
            {
              oHwmc.wfdose = res;  //' Warf dose since last Test
              break;
              //'alert(wfdose);
            }
        case "CHIST":
            {
              oHwmc.histcom = res.replace(/'/g,"''");  //' History Comments, Convert Apostrophe
              break;
              //'alert(histcom);
            }
        case "DCODE1":
            {
              oHwmc.ldcode1 = res.replace(/'/g,"''");  //' Report Doc Code, Convert Apostrophe
              break;
              //'alert(ldcode1);
            }
        case "LMO1":
            {
              oHwmc.lmo1 = res.replace(/'/g,"''");  //' LMO Details, Convert Apostrophe
              break;
              //'alert(lmo1);
            }
        case "PERM1":
            {
              oHwmc.perm1 = res;   //' Permanent
              break;
              //'alert(perm1);
            }
        case "EDATE1":
            {
              var enddate1 = TDateAndTime();
              try
              {
                //enddate1.ReadDate('dd/mm/yyyy',res,true);
                if (res.length == 8)
                {
                  enddate1.ReadDate('dd/mm/yy',res,true);
                }
                else
                {
                  enddate1.ReadDate('dd/mm/yyyy',res,true);
                }
                if (ValidSqlSmallDateTime(enddate1))
                {
                  oHwmc.edate1 = enddate1.AsString;    //' End Date Use Date Object from res data value for SQL date compliance issues
                }
                else
                {
                  oHwmc.edate1 = "";    //' Next Test Date not acceptable
                }
                enddate1 = null;
              }
              catch(e)
              {
                oHwmc.edate1 = "";  //' End date set to blank
              }
              break;
              //'alert(edate1);
            }
        case "STINR":
            {
              oHwmc.stinr = res;   //' Specific Target INR STINR
              break;
              //'alert(stinr);
            }
        default:  dat = "OBXNODATA";
      }
      cntobx++;
    }
  }
}

// class   : BGENCHData
// purpose : Constructer for BGENCHData class
// return  : Blank object returned for use.
function BGENCHData(data)
{
  this.test = data[0];        //' Test Type
  this.na = data[1];          //' Na result
}
// ProcessBGENCHData
// purpose : to build the oBgench data object
// return the oBgench data object populated with relevant data
function ProcessBGENCHData(m,oBgench)
{
  var cntobx=0;
  var segNum = m.SegmentCount;
  for (var i=0; (i < segNum); i++)
  {
    var SegItem = m.SegmentByIndex(i).code;
    //alert("SegItem: " + SegItem + " " + i.toString());
    if (SegItem == "OBX")
    {
      //var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      if (m.element("OBX:" + cntobx + "-3-3").AsString.toUpperCase() != "LN")
      {
        var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      }
      else
      {
        var id =  m.element("OBX:" + cntobx + "-3-4").AsString.toUpperCase();
      }
      var sts = m.element("OBX:" + cntobx + "-11").AsString.toUpperCase();
      var repnum = m.segmentByIndex(i).element("5").RepeatCount;                //'Count number of repeats in current OBX-5
      var res = GetRes(m,i,cntobx,repnum)                                              //'Set res as Value depending on repeats
      switch (id)
      {
        case "TType":
            {
              oBgench.test = res;  //'Test Type
              break;
              //'alert(Test);
            }
        case "NA":
            {
              oBgench.na = res.replace(/'/g,"''");  //' Na result from Bgench
              break;
              //'alert(lmo2);
            }
        default:  dat = "OBXNODATA";
      }
      cntobx++;
    }
  }
}


// class   : BBANKData
// purpose : Constructer for BBANKData class
// return  : Blank object returned for use.
function BBANKData(data)
{
  this.bgrp = data[0];        //' Blood Group
  this.absc = data[1];        //' Ab screen
  this.abody = data[2];       //' Ab's Text
}
// ProcessBBANKData
// purpose : to build the oBbank data object
// return the oBbank data object populated with relevant data
function ProcessBBANKData(m,oBbank)
{
  var cntobx=0;
  var segNum = m.SegmentCount;
  for (var i=0; (i < segNum); i++)
  {
    var SegItem = m.SegmentByIndex(i).code;
    //alert("SegItem: " + SegItem + " " + i.toString());
    if (SegItem == "OBX")
    {
      if (m.element("OBX:" + cntobx + "-3-3").AsString.toUpperCase() != "LN")
      {
        var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      }
      else
      {
        var id =  m.element("OBX:" + cntobx + "-3-4").AsString.toUpperCase();
      }
      var sts = m.element("OBX:" + cntobx + "-11").AsString.toUpperCase();
      var repnum = m.segmentByIndex(i).element("5").RepeatCount;                //'Count number of repeats in current OBX-5
      var res = GetRes(m,i,cntobx,repnum)                                       //'Set res as Value depending on repeats
      switch (id)
      {
        case "BGRP":
            {
              oBbank.bgrp = res;  //'Blood Group
              break;
              //'alert(Blood Group);
            }
        case "ABSC":
            {
              oBbank.absc = res.replace(/'/g,"''");  //' Antibody Screen
              break;
              //'alert(Antibody Screen);
            }
        case "ABODY":
            {
              oBbank.abody = res.replace(/'/g,"''").replace("\T\#2;","");  //' Antibody ID
              break;
              //'alert(Antibody ID);
            }
        default:  dat = "OBXNODATA";
      }
      cntobx++;
    }
  }
}

// class   : HCOAGData
// purpose : Constructer for HCOAG Data class
// return  : Blank object returned for use.
function HCOAGData(data)
{
  this.pt = data[0];       //' PT
  this.inr = data[1];      //' INR
  this.aptt = data[2];     //' APTT
  this.fib = data[3];      //' Fibrinogen
}

// ProcessHCOAGData
// purpose : to build the oHcoag data object
// return the oHcoag data object populated with relevant data
function ProcessHCOAGData(m,oHcoag)
{
  var cntobx=0;
  var segNum = m.SegmentCount;
  for (var i=0; (i < segNum); i++)
  {
    var SegItem = m.SegmentByIndex(i).code;
    //alert("SegItem: " + SegItem + " " + i.toString());
    if (SegItem == "OBX")
    {
      //var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      if (m.element("OBX:" + cntobx + "-3-3").AsString.toUpperCase() != "LN")
      {
        var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      }
      else
      {
        var id =  m.element("OBX:" + cntobx + "-3-4").AsString.toUpperCase();
      }
      var sts = m.element("OBX:" + cntobx + "-11").AsString.toUpperCase();
      var repnum = m.segmentByIndex(i).element("5").RepeatCount;                //'Count number of repeats in current OBX-5
      var res = GetRes(m,i,cntobx,repnum)                                              //'Set res as Value depending on repeats
      switch (id)
      {
        case "PT":
            {
              oHcoag.pt = res;     //'PT
              break;
              //'alert(PT);
            }
        case "INR":
            {
              oHcoag.inr = res;   //'INR
              break;
              //'alert(INR);
            }
        case "APTT":
            {
              oHcoag.aptt = res;  //'APTT
              break;
              //'alert(APTT);
            }
        case "FIB":
            {
              oHcoag.fib = res;  //'Fibrinogen
              break;
              //'alert(Fibrinogen);
            }
        default:  dat = "OBXNODATA";
      }
      cntobx++;
    }
  }
}

// class   : OBXDATA
// purpose : Constructer for OBXDATA Data class
// return  : Blank object returned for use.
function OBXDATA(data)
{
  this.obxdtype = data[0];        //' OBXDataType
  this.obxcode = data[1];         //' OBXCode
  this.obxlcode = data[2];        //' OBXLoincCode
  this.obxtestdesc = data[3];     //' OBXTestDescription
  this.obxtestrslt = data[4];     //' OBXTestResult
  this.obxunits = data[5];        //' OBXUnits
  this.obxrange = data[6];        //' OBXRange
  this.obxsubid = data[7];        //' OBXSubId
  this.obxabnflag = data[8];      //' OBXAbnFlag
  this.obxrdlfieldkey = data[9];  //' OBXRDLFieldID [OBXCode + "_" + Rdl.Key + InternalNumber]
  this.oOBXdtObs = data[10];      //' oOBXDateTimeObs
}

// GetOBXDataArray
// purpose : to build the OBX Data values array object
// return the OBX Data values array of OBX objects populated with relevant data
function GetOBXDataArray(aEvent,m,dbase,tbl,HL7Data)
{
  var i,j;
  var arrOBXDataObj = new Array();     // Array of OBXData objects
  var OBXCount = m.CountSegment("OBX")
  for (i=0; i<OBXCount; i++)
  {
    var arrTemp = new Array("","","","","","","","","","","");
    arrTemp[0] = m.element("OBX:" + i + "-2").AsString.toUpperCase();                      //' OBXDataType
    //Check for "LN" in OBX-3-3, which means LOINC is first.
    if (m.element("OBX:" + i + "-3-3").AsString.toUpperCase() == "LN")
    {
      //Check for Micro Hard code LOINC as only LOINC provided from PLS KScript. Set the OBX Codes. LOINC COdes pre-defined in PLS KScript but no local codes described.
      if ((m.element("OBX:" + i + "-3-1").AsString.toUpperCase() == "11475-1") || (m.element("OBX:" + i + "-3-1").AsString.toUpperCase() == "699-9") || (m.element("OBX:" + i + "-3-1").AsString.toUpperCase() == "29576-6"))
      {
        // Make changes here for specific Microbiology cases. Only the LOINC is provided by PLS.
        //arrTemp2 is always the LOINC code which is hard code provided by KScript.
        arrTemp[2] = m.element("OBX:" + i + "-3-1").AsString.toUpperCase();                //' OBXLCode
        switch (m.element("OBX:" + i + "-3-1").AsString.toUpperCase())
        {
          case "11475-1":
            {
              arrTemp[1] = "Cult" + m.element("OBX:" + i + "-4").AsString;   //' OBXCode hard set to use by Lab
              break;
            }
          case "699-9":
            {
              arrTemp[1] = "CultCnt" + m.element("OBX:" + i + "-4").AsString;   //' OBXCode hard set to use by Lab
              break;
            }
          case "29576-6":
            {
              arrTemp[1] = "AntiB" + m.element("OBX:" + i + "-4").AsString;   //' OBXCode hard set to use by Lab
              break;
            }
          default:  dat = "OBXNODATA";
        }
        //Base position if LOINC first.
        //arrTemp[1] = m.element("OBX:" + i + "-3-4").AsString.toUpperCase();                  //' OBXCode
        //arrTemp[2] = m.element("OBX:" + i + "-3-1").AsString.toUpperCase();                  //' OBXLCode
      }
      else
      {
        arrTemp[1] = m.element("OBX:" + i + "-3-4").AsString.toUpperCase();                  //' OBXCode
        arrTemp[2] = m.element("OBX:" + i + "-3-1").AsString.toUpperCase();                  //' OBXLCode
      }
    }
    else
    //LOINC is not first so code then LOINC repeat.
    {
      arrTemp[1] = m.element("OBX:" + i + "-3-1").AsString.toUpperCase();                  //' OBXCode
      arrTemp[2] = m.element("OBX:" + i + "-3-4").AsString.toUpperCase();                  //' OBXLCode
    }
    arrTemp[3] = m.element("OBX:" + i + "-3-2").AsString.toUpperCase().replace(/'/g,"''");  //' OBXTestCodeDescription
    arrTemp[4] = GetOBXRes(m,i);                                                           //' Set OBX5 Res value depending on repeats
    arrTemp[5] = m.element("OBX:" + i + "-6").AsString.toUpperCase().replace(/'/g,"''");    //' OBXUnits
    arrTemp[6] = m.element("OBX:" + i + "-7").AsString.toUpperCase();                      //' OBXRange
    arrTemp[7] = m.element("OBX:" + i + "-4").AsString.toUpperCase();                      //' OBXSubId
    arrTemp[8] = m.element("OBX:" + i + "-8").AsString.toUpperCase();                      //' OBXAbnFlag
    arrTemp[9] = arrTemp[1] + "_" + m.element("OBX:" + i + "-9").AsString.toUpperCase() + arrTemp[7];   //' OBXRDLFieldID [OBXCode + "_" + Rdl.Key + InternalNumber + SubID]
    //Check a date exists to be set as an object - Deletes do not have OBX data
    var tmpval = m.element("OBX:" + i + "-14").AsString.toUpperCase();
    if (tmpval != "")
    {
      var dtobs = TDateAndTime();
      dtobs.ReadDate('yyyymmddhhnnss',m.element("OBX:" + i + "-14").AsString.toUpperCase(),true);
      arrTemp[10] = dtobs;                                                                   //' OBXDateTimeObs
      dtobs = null;
    }
    arrOBXDataObj[i] = new OBXDATA(arrTemp);
    //Logger(DBG_PROCESS, "OBX Processed:" + i + " ,Key: " + arrKeys[j] + " ,Value: " + arrTemp[j], null);
  }
  return arrOBXDataObj;
}


// class   : CBBANKData
// purpose : Constructer for CBBANK Data class
// return  : Blank object returned for use.
function CBBANKData(data)
{
  this.frzdate = data[0];        //' Freeze date
  this.cbvolpre = data[1];       //' Volume Pre
  this.cbvol1 = data[2];         //' Volume 1
  this.cbvol2 = data[3];         //' Volume 2
  this.cbvol3 = data[4];         //' Volume 3
  this.cbtnccol = data[5];       //' Cbtncol (*10 for DB) 'Variables as 10^8 must be 10^7 below
  this.cbtncbuf = data[6];       //' Cbtncbuf (*10 for DB) 'Variables as 10^8 must be 10^7 below
  this.cbvolpost = data[7];      //' Volume Post
  this.cbtncproc = data[8];      //' Cbtncproc (*10 for DB) 'Variables as 10^8 must be 10^7 below
  this.cd34bag = data[9];        //' CD34 bag
  this.cbtnrbag = data[10];      //' Cbtnrbag (*10 for DB) 'Variables as 10^8 must be 10^7 below
  this.cbtnrtot = data[11];      //' cbtnrtot (*10 for DB) 'Variables as 10^8 must be 10^7 below
  this.bsex = data[12];          //' BSex
  //next define calculated variables
  this.cbvolfinal = data[13];    //' Volume1 + Volume2 + Volume3
  this.cbcolbag = data[14];      //' Cbtnccol + Cbtnrbag if cbtnrbag is not ""
  this.cbproctot = data[15];     //' Cbtncproc + Cbtnrtot if cbtnrbag is not ""
}

// ProcessCBBANKData
// purpose : to build the oCbbank data object
// return the oTxt data object populated with relevant data
function ProcessCBBANKData(m,oCbbank)
{
  var cntobx=0;
  var segNum = m.SegmentCount;
  for (var i=0; (i < segNum); i++)
  {
    var SegItem = m.SegmentByIndex(i).code;
    //alert("SegItem: " + SegItem + " " + i.toString());
    if (SegItem == "OBX")
    {
      //var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      if (m.element("OBX:" + cntobx + "-3-3").AsString.toUpperCase() != "LN")
      {
        var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      }
      else
      {
        var id =  m.element("OBX:" + cntobx + "-3-4").AsString.toUpperCase();
      }
      var sts = m.element("OBX:" + cntobx + "-11").AsString.toUpperCase();
      var repnum = m.segmentByIndex(i).element("5").RepeatCount;                //'Count number of repeats in current OBX-5
      var res = GetRes(m,i,cntobx,repnum)                                       //'Set res as Value depending on repeats
      switch (id)
      {
        case "FRZDATE":
            {
              oCbbank.frzdate = res;         //' Freeze date
              break;
              //'alert(FreezeDate);
            }
        case "CBVOLPRE":
            {
              oCbbank.cbvolpre = res;       //' Volume Prelmo2 
              break;
            }
        case "CBVOL1":
            {
              oCbbank.cbvol1 = res;         //' Volume 1
              break;
            }
        case "CBVOL2":
            {
              oCbbank.cbvol2 = res;         //' Volume 2
              break;
            }
        case "CBVOL3":
            {
              oCbbank.cbvol3 = res;         //' Volume 3
              break;
            }
        case "CBTNCCOL":
            {
              var cbtnccol = parseFloat(res)*10;
              oCbbank.cbtnccol = cbtnccol.toFixed(1);  //' Cbtncol (*10 for DB) 'Variables as 10^8 must be 10^7 below
              //alert("res: " + res);
              //alert("parseInt(res): " + (parseInt(res)*10));
              break;
            }
        case "CBTNCBUF":
            {
              var cbtncbuf = parseFloat(res)*10;
              oCbbank.cbtncbuf = cbtncbuf.toFixed(1);  //' Cbtncbuf (*10 for DB) 'Variables as 10^8 must be 10^7 below
              break;
            }
        case "CBVOLPOST":
            {
              oCbbank.cbvolpost = res;         //' Volume Post
              break;
            }
        case "CBTNCPROC":
            {
              var cbtncproc = parseFloat(res)*10;
              oCbbank.cbtncproc = cbtncproc.toFixed(1);  //' Cbtncproc (*10 for DB) 'Variables as 10^8 must be 10^7 below
              break;
            }
        case "CD34BAG":
            {
              oCbbank.cd34bag = res;         //' CD34 bag
              break;
            }
        case "CBTNRBAG":
            {
              var cbtnrbag = parseFloat(res)*10;
              oCbbank.cbtnrbag =  cbtnrbag.toFixed(1);  //' Cbtnrbag (*10 for DB) 'Variables as 10^8 must be 10^7 below
              break;
            }
        case "CBTNRTOT":
            {
              var cbtnrtot = parseFloat(res)*10;
              oCbbank.cbtnrtot = cbtnrtot.toFixed(1);  //' cbtnrtot (*10 for DB) 'Variables as 10^8 must be 10^7 below
              break;
            }
        case "BSEX":
            {
              oCbbank.bsex = res;         //' BSex
              break;
            }
        default:  dat = "OBXNODATA";
      }//switch
      cntobx++;
    }//if
  }//for
  oCbbank.cbvolfinal = parseInt(parseFloat(oCbbank.cbvol1) + parseFloat(oCbbank.cbvol2) + parseFloat(oCbbank.cbvol3));
  oCbbank.cbcolbag = parseInt(parseFloat(oCbbank.cbtnccol) + parseFloat(oCbbank.cbtnrbag));
  oCbbank.cbproctot = parseInt(parseFloat(oCbbank.cbtncproc) + parseFloat(oCbbank.cbtnrtot));
  if (isNaN(oCbbank.cbproctot)) oCbbank.cbproctot = 0;
}

// class   : CYTOData
// purpose : Constructer for CYTO Data class
// return  : Blank object returned for use.
function CYTOData(data)
{
  this.labnum = data[0];         //' Internal Lab number
  this.cat = data[1];            //' Category
  this.diag = data[2];           //' Diagnosis
  this.spec1 = data[3];          //' Specimen
  this.eccomp = data[4];         //' Endocervical Component
  this.recdate = data[5];        //' Recall Date
  this.recval = data[6];         //' Recall value
  this.psr = data[7];            //' Reg Codes
  this.rdpres = data[8];         //' Recall Date Present
  this.rvpres = data[9];         //' Recall Value Present
}

// ProcessCYTOData
// purpose : to build the oCyto data object
// return the oCyto data object populated with relevant data
function ProcessCYTOData(m,oCyto)
{
  var cntobx=0;
  var segNum = m.SegmentCount;
  for (var i=0; (i < segNum); i++)
  {
    var SegItem = m.SegmentByIndex(i).code;
    //alert("SegItem: " + SegItem + " " + i.toString());
    if (SegItem == "OBX")
    {
      //var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      if (m.element("OBX:" + cntobx + "-3-3").AsString.toUpperCase() != "LN")
      {
        var id =  m.element("OBX:" + cntobx + "-3-1").AsString.toUpperCase();
      }
      else
      {
        var id =  m.element("OBX:" + cntobx + "-3-4").AsString.toUpperCase();
      }
      var sts = m.element("OBX:" + cntobx + "-11").AsString.toUpperCase();
      var repnum = m.segmentByIndex(i).element("5").RepeatCount;                //'Count number of repeats in current OBX-5
      var res = GetRes(m,i,cntobx,repnum)                                       //'Set res as Value depending on repeats
      switch (id)
      {
        case "LABNUM":
            {
              oCyto.labnum = res;                    //' Internal Lab Number
              break;
              //'alert(FreezeDate);
            }
        case "CAT":
            {
              oCyto.cat = res.replace(/'/g,"''");     //' Category ' Convert Apostrophe for Category
              break;
            }
        case "DIAG":
            {
              oCyto.diag = res.replace(/'/g,"''");    //' Diagnosis ' Convert Apostrophe for Category
              break;
            }
        case "SPEC1":
            {
              oCyto.spec1 = res.replace(/'/g,"''");   //' Specimen ' Convert Apostrophe for Category
              break;
            }
        case "ECCOMP":
            {
              oCyto.eccomp = res.replace(/'/g,"''");  //' Endocervical Component ' Convert Apostrophe for Category
              break;
            }
        case "RECDATE":
            {
              oCyto.recdate = res;                  //' Recommendation Date ' Convert Apostrophe for Category
              oCyto.rdpres = true;
              break;
            }
        case "RECVAL":
            {
              oCyto.recval = res;                    //' Recal Value ' Convert Apostrophe for Category
              oCyto.rvpres = true;
              break;
            }
        case "PSR":
            {
              oCyto.psr = res;                       //' Reg Codes
              break;
            }
        default:  dat = "OBXNODATA";
      }//switch
      cntobx++;
    }//if
  }//for
  if (oCyto.rdpres) oCyto.recval = "";
  if (oCyto.rvpres && oCyto.rdpres) oCyto.recval = "";
  var recvaltmp = oCyto.recval.replace(" ","").toUpperCase();
  if (oCyto.rvpres && !oCyto.rdpres)
  {
    if ((recvaltmp == "NORECOMMENDATION") || (recvaltmp == "NOTAPPLICABLE"))
    {
      oCyto.recdate = "";
    }
    else
    {
      oCyto.recdate = oCyto.recval
      oCyto.srecdate = "";
      var oRecDate = TDateAndTime();
      oRecDate.ReadDate('dd/mm/yyyy',oCyto.recval,true);
      oCyto.recdate = oRecDate;                //' OBXDateTimeObs
      oRecDate = null;
      oCyto.recval = "";
    }
  }
}

//
// ProcessSampleList
// purpose : to update the tblEpe_SampleList
// return  : void
function ProcessSampleList(dbase,tbl,HL7Data)
{
  BreakPoint;
  var deleteRecords = false;
  var fieldList = "PatientNo,EpisodeNo,SampleNumber";
  var idx;
  // Firstly get the tests list from the dictionary
  var PLSSamples = (new VBArray(HL7Data.DicSampleList.Items())).toArray();   // Get the keys.
  //Next build the SQL variables to delete all records and delete them.
  var wList = tbl + ".PatientNo) = '"+HL7Data.PatID.PlsNum+"' and (" + tbl + ".EpisodeNo) = '"+HL7Data.ReqNum+"'";
  var resultList = "";
  var updateList = "";
  var OrderStatus = "";
  deleteRecords = true;
  addon = false;
  //shell.Popup("Deleting WorkList: " + wList,undefined,undefined,64);  // that's the #64?
  ProcSQLData(dbase,tbl,HL7Data,wList,fieldList,resultList,updateList,"CA",deleteRecords);
  deleteRecords = false;
  //Next add all test entries in sequence.
  //for (idx in PLSSamples)                  // Iterate the dictionary.
  for (var i=0; i<PLSSamples.length; i++)
  {
    //Logger(DBG_PROCESS,"SampleList Individual SQL Items: " + PLSSamples[idx]);
    //var wList = tbl + ".PatientNo) = '"+HL7Data.PatID.PlsNum+"' and (" + tbl + ".EpisodeNo) = '"+HL7Data.ReqNum+"' and ("  + tbl + ".SampleNumber) = '"+PLSSamples[idx]+"'";
    //var resultList = "'"+HL7Data.PatID.PlsNum+"','"+HL7Data.ReqNum+"','"+PLSSamples[idx]+"'";
    //var updateList = "PatientNo = '"+HL7Data.PatID.PlsNum+"', EpisodeNo = '"+HL7Data.ReqNum+"', SampleNumber = '"+PLSSamples[idx]+"'";
    Logger(DBG_PROCESS,"SampleList Individual SQL Items: " + PLSSamples[i]);
    var wList = tbl + ".PatientNo) = '"+HL7Data.PatID.PlsNum+"' and (" + tbl + ".EpisodeNo) = '"+HL7Data.ReqNum+"' and ("  + tbl + ".SampleNumber) = '"+PLSSamples[i]+"'";
    var resultList = "'"+HL7Data.PatID.PlsNum+"','"+HL7Data.ReqNum+"','"+PLSSamples[i]+"'";
    var updateList = "PatientNo = '"+HL7Data.PatID.PlsNum+"', EpisodeNo = '"+HL7Data.ReqNum+"', SampleNumber = '"+PLSSamples[i]+"'";
    ProcSQLData(dbase,tbl,HL7Data,wList,fieldList,resultList,updateList,"SC",deleteRecords);
    //con.SQL = "INSERT INTO " + tbl + "(" + fieldList + ") VALUES (" + resultList + ")";
    //con.Prepare;
    //con.Execute;
    //con.Terminate;
  }
  PLSSamples = null;
  return;
}

//
// FindMatchingSQLRecord
// purpose : to find the iPM PatientUpdate return HL7 matching SQL record
// purpose : Return the record Found Boolean if a matching record is found in PLS SQL
// return  : Boolean RecordFound True/False
function FindMatchingSQLRecord(aEvent,m,dbase,tbl,HL7Data)
{
  var RecordFound = false;
  var db = kernel.GetDB(dbase);  //' get a handle to the global database pool
  var con = db.GetConnection(dbase);
  try
  {
    //Get the Row Id key
    var PUKey = db.Lookup("tblPLS_PatUpdates","PLSID",HL7Data.PatID.ADTPlsNum,"Id","-1");
    //If key is found: The returned PLS Patient Key for Matching
    if (PUKey != "-1")
    {
      //If Urno returned is available and not blank
      if (HL7Data.PatID.Urno != "")
      {
        //Entry is in table as Id found so update mater URNO against the table entry in SQL and set return boolean as true.
        var rowsAffect = con.ExecSQL("UPDATE tblPLS_PatUpdates SET PMI_URNO = '"+HL7Data.PatID.Urno+"' WHERE (tblPLS_PatUpdates.Id) = '"+PUKey+"'");
        RecordFound = true;
      }
    }
  }
  catch(e)
  {
    Logger(DBG_ERROR,"HL7Connect Message","john.carey@mater.org.au","HL7ConnectGW5@mater.org.au","Message: Error adding URNO to PatUpdates entry in SQL. Update failure for Message: " + HL7Data.MsgID);
  }
  con.terminate;
  db.YieldConnection(con,'');
  con = null;
  db = null;
  return(RecordFound);
}











/*
        switch (m.element("OBX:" + i + "-3-1").AsString.toUpperCase())
        {
          case "11475-1":
            {
              arrTemp[1] = "Cult" + m.element("OBX:" + i + "-4").AsString;   //' OBXCode hard set to use by Lab
              break;
            }
          case "699-9":
            {
              arrTemp[1] = "CultCnt" + m.element("OBX:" + i + "-4").AsString;   //' OBXCode hard set to use by Lab
              break;
            }
          case "29576-6":
            {
              arrTemp[1] = "AntiB" + m.element("OBX:" + i + "-4").AsString;   //' OBXCode hard set to use by Lab
              break;
            }
          default:  dat = "OBXNODATA";
        }
*/