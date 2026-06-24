import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { CivicIssue } from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API Client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running in high-fidelity mock mode.");
}

// Pre-populated application state
let issues: CivicIssue[] = [
  {
    id: "issue_1",
    title: "Burst Water Main causing road flooding",
    description: "Huge amounts of water are bubbling up from under Oak Avenue. The entire road is flooded, traffic is diverted, and water pressure in the neighborhood has completely dropped. This requires emergency shutoff.",
    category: "Water & Sanitation",
    status: "Dispatched to City",
    reportedBy: "Marcus Vance",
    reportedAt: "2026-06-24 08:32 AM",
    heroScoreAwarded: 55,
    imageUrl: "water_leak",
    location: { x: 25, y: 35, address: "240 Oak Avenue, Sector 3" },
    agents: {
      validation: {
        isValid: true,
        correctedText: "Major burst water main on Oak Avenue causing significant localized flooding, traffic disruptions, and a complete drop in residential water pressure.",
        explanation: "Validated as a high-severity municipal water infrastructure failure based on flooding description and loss of service to residents."
      },
      prioritization: {
        severityScore: 9,
        impactRadius: 500,
        reasoning: "Floodwater poses physical safety risks to motorists and pedestrians, while water utility outage impacts multiple blocks of residential properties."
      },
      dispatch: {
        assignedDepartment: "Water & Sanitation Dept",
        workOrderNumber: "WO-2026-9841",
        draftedWorkOrder: "EMERGENCY DISPATCH: Crew requested for immediate main shutoff and pipe replacement at 240 Oak Avenue. Coordinate with Traffic Control to block affected lanes.",
        estimatedResolution: "4-6 hours"
      }
    }
  },
  {
    id: "issue_2",
    title: "Deep pothole blocking main lane on Express Highway",
    description: "There's an incredibly deep, tire-popping pothole in the middle lane of the Expressway just before the 10th street off-ramp. Cars are swerving violently to avoid it at 60mph, which is extremely dangerous.",
    category: "Roads & Transit",
    status: "Dispatched to City",
    reportedBy: "Elena Rostova",
    reportedAt: "2026-06-23 04:15 PM",
    heroScoreAwarded: 50,
    imageUrl: "pothole",
    location: { x: 50, y: 65, address: "Express Highway, Mile Marker 12.4" },
    agents: {
      validation: {
        isValid: true,
        correctedText: "Deep pothole in the middle lane of the Expressway near the 10th street exit ramp. Swerving highway traffic poses an immediate safety hazard.",
        explanation: "Confirmed as an active road safety hazard requiring emergency asphalt repair."
      },
      prioritization: {
        severityScore: 8,
        impactRadius: 200,
        reasoning: "High-speed road hazard increases probability of high-impact collisions or severe vehicle damage."
      },
      dispatch: {
        assignedDepartment: "Street Maintenance & Roads",
        workOrderNumber: "WO-2026-8012",
        draftedWorkOrder: "PRIORITY REPAIR: Mobilize rapid asphalt patching vehicle to Expressway Mile Marker 12.4. Apply temporary quick-set cold mix patch immediately, full resurfacing scheduled next week.",
        estimatedResolution: "12 hours"
      }
    }
  },
  {
    id: "issue_3",
    title: "Broken streetlight near Lincoln High School",
    description: "The street light at the corner near Lincoln High's east gate has been dead for a week. The school perimeter is extremely pitch black after 5 PM. Students waiting for evening sports practices feel very unsafe.",
    category: "Public Works",
    status: "Resolved",
    reportedBy: "Clara Dubois",
    reportedAt: "2026-06-22 09:10 AM",
    heroScoreAwarded: 30,
    imageUrl: "streetlight",
    location: { x: 75, y: 20, address: "Lincoln High School East Gate" },
    agents: {
      validation: {
        isValid: true,
        correctedText: "Malfunctioning street light bulb on Pole #L-32 adjacent to Lincoln High School east gate, leading to poor perimeter visibility during evening hours.",
        explanation: "Validated as a standard public lighting maintenance request in a high-pedestrian school zone."
      },
      prioritization: {
        severityScore: 4,
        impactRadius: 50,
        reasoning: "While not a systemic outage, lack of illumination near a school perimeter introduces safety concerns for students after dark."
      },
      dispatch: {
        assignedDepartment: "Electrical & Public Lighting",
        workOrderNumber: "WO-2026-4421",
        draftedWorkOrder: "PUBLIC LIGHTING TASK: Inspect Pole L-32 east of Lincoln High School. Replaced broken high-pressure sodium bulb and verified photo-sensor controls are operational.",
        estimatedResolution: "Completed"
      }
    }
  },
  {
    id: "issue_4",
    title: "Illegal waste dumping on Riverfront Park trail",
    description: "Someone dumped a bunch of old car tires, a stained mattress, and several chemical-smelling plastic jugs right by the beginning of the Riverfront Park North Trail. It looks horrible and might leak into the soil.",
    category: "Waste Management",
    status: "Pending Validation",
    reportedBy: "Sanjay Kumar",
    reportedAt: "2026-06-24 11:05 AM",
    heroScoreAwarded: 40,
    imageUrl: "dumping",
    location: { x: 40, y: 45, address: "Riverfront Park North Trail Head" },
    agents: {
      validation: {
        isValid: true,
        correctedText: "Illegal dumping of residential and hazardous waste (mattress, tires, chemical jugs) at the entrance of Riverfront Park North Trail.",
        explanation: "Validated as environmental degradation and littering in a public park area with potential chemical run-off risk."
      },
      prioritization: {
        severityScore: 6,
        impactRadius: 150,
        reasoning: "Chemical containers pose potential soil/water contamination in public parklands. Requires fast remediation and specialized cleanup."
      },
      dispatch: {
        assignedDepartment: "Environmental Protection & Waste",
        workOrderNumber: "WO-2026-0091",
        draftedWorkOrder: "ENVIRONMENTAL REMEDIATION: Clean and dispose of bulky waste (tires/mattress) from Riverfront Park trailhead. Safely test and remove the chemical jugs according to hazmat disposal guidelines.",
        estimatedResolution: "24-48 hours"
      }
    }
  },
  {
    id: "issue_5",
    title: "Overgrown tree limbs obstructing Stop sign",
    description: "At the intersection of 4th Ave and Pine St, the stop sign is completely covered by thick tree limbs from an overgrown oak tree. Drivers coming down Pine street cannot see the stop sign at all until they are in the middle of the intersection.",
    category: "Parks & Recreation",
    status: "Resolved",
    reportedBy: "Devon Miller",
    reportedAt: "2026-06-21 11:20 AM",
    heroScoreAwarded: 35,
    imageUrl: "trees",
    location: { x: 60, y: 80, address: "Intersection of 4th Ave & Pine St" },
    agents: {
      validation: {
        isValid: true,
        correctedText: "Overgrown foliage from a municipal parkway oak tree fully obstructing the regulatory stop sign visibility at 4th Ave and Pine St.",
        explanation: "Validated as a traffic safety issue caused by unmaintained public parkway trees."
      },
      prioritization: {
        severityScore: 5,
        impactRadius: 30,
        reasoning: "Obstructed traffic control devices heavily increase intersection collision risks, requiring prompt pruning."
      },
      dispatch: {
        assignedDepartment: "Parks, Forestry & Horticulture",
        workOrderNumber: "WO-2026-2134",
        draftedWorkOrder: "FORESTRY ACTIONS: Prune overgrown oak tree limbs on the northwest corner of 4th & Pine to restore 100% visibility of the stop sign from Pine Street approach. Cleared sightlines complete.",
        estimatedResolution: "Completed"
      }
    }
  }
];

// 1. GET /api/issues - Retrieve all issues
app.get("/api/issues", (req, res) => {
  res.json(issues);
});

// Helper: Generates realistic mock analysis if API key is not present or fails
function getMockAgentAnalysis(title: string, description: string, category: string): any {
  const normalizedTitle = title.toLowerCase();
  const normalizedDesc = description.toLowerCase();

  let severity = 5;
  let radius = 100;
  let department = "Public Works";
  let explanation = "Validated as standard community request.";
  let reasoning = "Standard priority based on municipal scope.";
  let correctedText = `Reported ${normalizedTitle}: ${description}`;

  // Smart heuristic based on keywords
  if (normalizedDesc.includes("flood") || normalizedDesc.includes("leak") || normalizedDesc.includes("water") || normalizedDesc.includes("burst")) {
    severity = 9;
    radius = 450;
    department = "Water & Sanitation Dept";
    explanation = "Water utilities emergency. Severe potential for urban flooding and property damage.";
    reasoning = "High flow rates can erode roadbeds and impact local drinking supply pressure.";
    correctedText = `Severe water main failure or burst pipe leading to flooding. Urgent intervention required.`;
  } else if (normalizedDesc.includes("hole") || normalizedDesc.includes("road") || normalizedDesc.includes("asphalt") || normalizedDesc.includes("pothole") || normalizedDesc.includes("pavement")) {
    severity = 7;
    radius = 120;
    department = "Street Maintenance & Roads";
    explanation = "Road surface degradation affecting vehicle alignment and tire integrity.";
    reasoning = "Potholes on active thoroughfares present swerving and physical impact hazards to drivers.";
    correctedText = `Significant road surface pothole requiring standard asphalt patching.`;
  } else if (normalizedDesc.includes("light") || normalizedDesc.includes("dark") || normalizedDesc.includes("bulb") || normalizedDesc.includes("electricity")) {
    severity = 4;
    radius = 60;
    department = "Electrical & Public Lighting";
    explanation = "Outage on individual public lighting asset.";
    reasoning = "Reduced night-time security but localized to a small radius.";
    correctedText = `Broken bulb or faulty ballast on municipal street light pole.`;
  } else if (normalizedDesc.includes("dump") || normalizedDesc.includes("trash") || normalizedDesc.includes("garbage") || normalizedDesc.includes("litter")) {
    severity = 6;
    radius = 150;
    department = "Environmental Protection & Waste";
    explanation = "Unsanitary debris storage on public or parkland domains.";
    reasoning = "Attracts pests, contaminates ecosystems, and decreases local property value.";
    correctedText = `Accumulation of bulky illegal trash dumping in public areas.`;
  } else if (normalizedDesc.includes("tree") || normalizedDesc.includes("branch") || normalizedDesc.includes("foliage") || normalizedDesc.includes("park") || normalizedDesc.includes("sign")) {
    severity = 5;
    radius = 40;
    department = "Parks, Forestry & Horticulture";
    explanation = "Foliage growth encroaching on utility wires or traffic visibility.";
    reasoning = "Moderate threat level depending on whether it obscures emergency regulatory signage.";
    correctedText = `Overgrown vegetative branches obstructing public right of way.`;
  }

  // Generate random work order id
  const randomId = Math.floor(1000 + Math.random() * 9000);

  return {
    validation: {
      isValid: true,
      correctedText,
      explanation
    },
    prioritization: {
      severityScore: severity,
      impactRadius: radius,
      reasoning
    },
    dispatch: {
      assignedDepartment: department,
      workOrderNumber: `WO-2026-${randomId}`,
      draftedWorkOrder: `OFFLINE SIMULATION DISPATCH: Crew scheduled for addressing ${title}. Technicians are advised to bring safety barricades and proceed to location.`,
      estimatedResolution: `${severity >= 8 ? "6-12 hours" : "2-4 days"}`
    }
  };
}

// POST /api/gemini - Submit new issue and run Gemini Agentic workflow
app.post("/api/gemini", async (req, res) => {
  const { title, description, category, lat, lng } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  const finalLat = lat !== undefined ? lat : (Math.random() * 0.1 + 28.5);
  const finalLng = lng !== undefined ? lng : (Math.random() * 0.1 + 77.1);

  if (ai) {
    try {
      console.log(`Analyzing issue via Gemini model for: "${title}"`);

      const prompt = `
        You are the Core Orchestrator of a Smart City civic reporting system called "Community Hero". 
        A citizen has submitted a civic report. You must process it by simulating a multi-agent negotiation environment:
        
        1. 'Prioritization Agent': Argues for maximum safety and evaluates the hazard level (1 to 10).
        2. 'Dispatch Agent': Argues for resource optimization, assigns a department, and enforces strict safety-oriented protocols by drafting a 'formalMunicipalComplaint' that includes rigorous first-aid/containment steps (e.g., "Erect physical barricades...").

        Citizen Report Details:
        - Title: "${title}"
        - Category: "${category || "General"}"
        - Citizens Detailed Description: "${description}"

        Analyze the report and output a structured JSON matching the requested schema.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING },
              validationAgent: { 
                type: Type.OBJECT,
                properties: { isValid: { type: Type.BOOLEAN } },
                required: ["isValid"]
              },
              prioritizationAgent: {
                type: Type.OBJECT,
                properties: {
                  hazardLevel: { type: Type.INTEGER },
                  calculatedImpactScore: { type: Type.NUMBER }
                },
                required: ["hazardLevel", "calculatedImpactScore"]
              },
              dispatchAgent: {
                type: Type.OBJECT,
                properties: {
                  assignedDepartment: { type: Type.STRING },
                  formalMunicipalComplaint: { type: Type.STRING }
                },
                required: ["assignedDepartment", "formalMunicipalComplaint"]
              },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER }
            },
            required: ["title", "description", "status", "validationAgent", "prioritizationAgent", "dispatchAgent", "lat", "lng"]
          }
        }
      });

      if (response && response.text) {
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        // Ensure lat/lng are present
        if (!result.lat) result.lat = finalLat;
        if (!result.lng) result.lng = finalLng;
        return res.json(result);
      }
    } catch (apiError: any) {
      console.warn(`Gemini API error (${apiError?.status || 'unknown status'}). Falling back to offline simulator.`);
    }
  }

  // Fallback if no AI or error
  return res.json({
    title: title,
    description: description,
    status: "In AI Verification",
    validationAgent: { isValid: true },
    prioritizationAgent: { hazardLevel: 8, calculatedImpactScore: 9.6 },
    dispatchAgent: { assignedDepartment: "Public Works", formalMunicipalComplaint: "Erect physical barricades and dispatch emergency containment team." },
    lat: finalLat,
    lng: finalLng
  });
});

// Serve Frontend using Vite Dev Server in Development or Static Files in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite Dev Middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Community Hero Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
