import React, { useState, useEffect } from "react";

export default function App() {
  const [search, setSearch] = useState("");
  const [alarmData, setAlarmData] = useState({});
  const [componentAlarms, setComponentAlarms] = useState({});
  const [equipmentStructure, setEquipmentStructure] = useState({});
  const [selectedAlarm, setSelectedAlarm] = useState(null);
  const [highlight, setHighlight] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // ✅ CSV 불러오기
  useEffect(() => {
    fetch("/alarm.csv")
      .then((res) => res.text())
      .then((text) => {
        const rows = text.split("\n").slice(1);

        const alarmObj = {};
        const compMap = {};
        const equipMap = {};

        rows.forEach((row) => {
          if (!row.trim()) return;

          const [
            code,
            description,
            message,
            cause,
            troubleshooting,
            component,
            equipment
          ] = row.split(",");

          const cleanCode = code.trim();

          alarmObj[cleanCode] = {
            description,
            message,
            cause,
            troubleshooting,
            components: [component],
            equipment
          };

          // 부품별 알람
          if (!compMap[component]) compMap[component] = [];
          compMap[component].push(cleanCode);

          // 장비별 구조
          if (!equipMap[equipment]) equipMap[equipment] = [];
          if (!equipMap[equipment].includes(component)) {
            equipMap[equipment].push(component);
          }
        });

        setAlarmData(alarmObj);
        setComponentAlarms(compMap);
        setEquipmentStructure(equipMap);
      });
  }, []);

  const reset = () => {
    setSelectedAlarm(null);
    setHighlight([]);
    setSelectedComponent(null);
  };

  const handleSearch = () => {
    const alarm = alarmData[search];
    if (alarm) {
      reset();
      setSelectedAlarm(alarm);
      setHighlight(alarm.components);
      setSelectedEquipment(alarm.equipment);
    } else {
      alert("알람 코드 없음");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>

      {/* ✅ 왼쪽 장비 */}
      <div style={{ flex: 2, padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="알람 코드"
            style={{ padding: 8, marginRight: 10 }}
          />
          <button onClick={handleSearch}>검색</button>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {Object.keys(equipmentStructure).map((eq) => (
            <div
              key={eq}
              style={{
                width: 300,
                height: 300,
                border: "2px solid black",
                position: "relative",
                backgroundImage: `url('/${eq}.png')`,
                backgroundSize: "cover"
              }}
            >
              <div style={{ position: "absolute", top: 10, left: 10 }}>
                {eq}
                <button
                  onClick={() => {
                    reset();
                    setSelectedEquipment(eq);
                  }}
                >
                  내부
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ 오른쪽 패널 */}
      <div
        style={{
          flex: 1,
          borderLeft: "2px solid gray",
          padding: 20,
          background: "#f9f9f9"
        }}
      >
        {/* Flow */}
        {selectedEquipment && (
          <div style={{ marginBottom: 30 }}>
            <h3>{selectedEquipment} Flow</h3>

            <div style={{ display: "flex", gap: 10 }}>
              {equipmentStructure[selectedEquipment].map((comp, i) => (
                <React.Fragment key={comp}>
                  <div
                    onClick={() => {
                      reset();
                      setSelectedComponent(comp);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 5,
                      border: "1px solid gray",
                      background: highlight.includes(comp) ? "red" : "white",
                      color: highlight.includes(comp) ? "white" : "black",
                      cursor: "pointer"
                    }}
                  >
                    {comp}
                  </div>

                  {i < equipmentStructure[selectedEquipment].length - 1 && (
                    <div>→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* 부품 알람 */}
        {selectedComponent && (
          <div style={{ marginBottom: 30 }}>
            <h3>{selectedComponent} 알람</h3>

            {componentAlarms[selectedComponent]?.map((code) => (
              <button
                key={code}
                style={{ display: "block", marginBottom: 5 }}
                onClick={() => {
                  const alarm = alarmData[code];
                  reset();
                  setSelectedAlarm(alarm);
                  setHighlight(alarm.components);
                  setSelectedEquipment(alarm.equipment);
                }}
              >
                {code}
              </button>
            ))}
          </div>
        )}

        {/* ✅ 알람 상세 */}
        {selectedAlarm && (
          <div style={{
            background: "white",
            padding: 15,
            borderRadius: 8,
            boxShadow: "0 0 5px rgba(0,0,0,0.1)"
          }}>
            <h3>알람 상세</h3>

            <p><b>Description</b><br />{selectedAlarm.description}</p>
            <p><b>Message</b><br />{selectedAlarm.message}</p>
            <p style={{ color: "red" }}>
              <b>원인</b><br />{selectedAlarm.cause}
            </p>
            <p style={{ color: "green" }}>
              <b>트러블슈팅</b><br />{selectedAlarm.troubleshooting}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}