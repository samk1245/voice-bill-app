// Lumina Logistics AI Simulator Engine

// --- Initial Mock Databases (RAG Context) ---
let DB = {
  shipments: [
    { id: "TRK-1002", origin: "Boston (BOS)", destination: "New York (NYC)", status: "Delivered", carrier: "FedRoad Express", eta: "2026-06-14", location: "NYC Central Depot", details: "Arrived at destination hub on schedule. Signed by reception.", weight: "250 lbs", urgency: "Standard" },
    { id: "TRK-9823", origin: "Seattle (SEA)", destination: "Chicago (ORD)", status: "Delayed", carrier: "RailLink Logistics", eta: "2026-06-18", location: "Fargo Hub Yard", details: "Delayed by severe storm in Upper Midwest. Rail cars parked temporarily.", weight: "4,200 lbs", urgency: "High" },
    { id: "TRK-4491", origin: "Miami (MIA)", destination: "Houston (HOU)", status: "In Transit", carrier: "OceanBreeze Cargo", eta: "2026-06-17", location: "Tampa Bay Facility", details: "En route. Standard custom clearance logs filed. Scheduled border crossing on time.", weight: "12,500 lbs", urgency: "Medium" }
  ],
  fleet: [
    { truck: "TRUCK-05", driver: "Marcus Vance", route: "BOS -> NYC", fuel: "84%", load: "LTL (7,500 lbs)", status: "Active", maintenance: "Oil change due in 450 mi" },
    { truck: "TRUCK-12", driver: "Elena Rostova", route: "ORD -> MSP", fuel: "45%", load: "FTL (32,000 lbs)", status: "In Transit", maintenance: "Annual inspection July 1" },
    { truck: "TRUCK-29", driver: "Davis K.", route: "LAX -> PHX", fuel: "18%", load: "Empty", status: "Needs Fuel", maintenance: "Route optimization suggested" }
  ],
  warehouse: [
    { sku: "SKU-8820", name: "Heavy-Duty Castings", bin: "B-14-3", qty: "450", unit: "pcs", status: "In Stock", weight: "15 lbs" },
    { sku: "SKU-3112", name: "Copper Tubing 1/2\"", bin: "A-08-1", qty: "0", unit: "rolls", status: "Out of Stock", weight: "8 lbs" },
    { sku: "SKU-9045", name: "Solar Inverters 5kW", bin: "C-22-5", qty: "82", unit: "units", status: "Reserved", weight: "45 lbs" }
  ],
  rates: [
    { service: "LTL Base (Less-Truckload)", rate: "$1.25 / lb", speed: "3-5 Business Days" },
    { service: "FTL Base (Full-Truckload)", rate: "$2.65 / mile", speed: "2-3 Business Days" },
    { service: "Priority Air Express", rate: "Base x 2.20", speed: "Next Day Delivery" },
    { service: "HAZMAT Surcharge", rate: "+$250 flat fee", speed: "Adds 1 Day for inspections" }
  ],
  sops: [
    { key: "claims", title: "SOP-Sec-4.2: Damage & Loss Claims", text: "Damaged shipments must be reported within 48 hours of receipt. Carrier liability limit: $0.50/lb unless declared value is annotated on BOL. Claims exceeding $5,000 require VP Operations approval." },
    { key: "customs", title: "SOP-Sec-9.1: Border & Customs Protocol", text: "All cross-border cargo requires Commercial Invoice, Packing List, and NAFTA Certificate. ACE electronic manifest must be logged 60 minutes prior to border gate arrival." },
    { key: "safety", title: "SOP-Sec-1.5: Hours of Service (HOS)", text: "Maximum driving limit: 11 hours following 10 consecutive hours off duty. Mandatory 30-minute break must occur within first 8 hours of continuous operation." }
  ]
};

// Deep copy initial DB for resets
const INITIAL_DB = JSON.parse(JSON.stringify(DB));

// --- Agent Persona Specifications ---
const AGENTS = [
  {
    id: "general",
    name: "Master Logistics Assistant",
    role: "General Enterprise Assistant",
    avatar: "🤖",
    color: "var(--accent-cyan)",
    systemPrompt: `You are the Master System AI for Lumina Logistics. Coordinate general operations, route user intents, answer enterprise queries, and delegate to specialized sub-agents. Maintain extreme professionalism, clear bulleted points, and never make up data. Keep answers operationally precise.`,
    suggestionChips: ["Status of shipments?", "Calculate shipping cost", "Check driver schedules", "WMS Bin lookup help"],
    initialMessage: "Hello, I am Lumina's Master Logistics AI. I can coordinate shipment tracking, route optimizations, warehouse inventory, freight pricing, and SOP compliance. What logistics support do you need today?"
  },
  {
    id: "tracking",
    name: "Shipment Tracking Bot",
    role: "Customer-Facing Tracking Specialist",
    avatar: "📦",
    color: "var(--accent-orange)",
    systemPrompt: `Act as a shipment tracking specialist for a logistics company.
Your goal is to help customers track shipments accurately.
Workflow:
1. Ask for:
   - Tracking number
   - Order ID
   - Phone/email linked to shipment (if needed)
2. Explain shipment status in plain English.
   Examples:
   - "Shipment departed origin hub" -> "Your shipment has left the warehouse and is currently in transit."
   - "Exception at facility" -> Explain possible causes and next actions.
3. If delayed:
   - Explain likely reasons
   - Provide updated ETA if available
   - Suggest escalation only if SLA threshold exceeded.
Never guess shipment status. If the status is not in the system, politely state that you cannot locate it.`,
    suggestionChips: ["Track TRK-1002", "Status of TRK-9823", "Is TRK-4491 delayed?", "Track a non-existent shipment"],
    initialMessage: "Welcome to Shipment Support. Please provide your Tracking Number, Order ID, or linked account details to retrieve status logs."
  },
  {
    id: "fleet",
    name: "Fleet Management Assistant",
    role: "Internal Dispatcher Support",
    avatar: "🚛",
    color: "var(--accent-blue)",
    systemPrompt: `You are an AI fleet management assistant.
Help dispatchers and fleet managers with:
- Vehicle allocation
- Route optimization
- Driver scheduling
- Fuel efficiency suggestions
- Maintenance reminders
- Delay prediction

When making recommendations:
- Prioritize cost efficiency
- Minimize delivery delays
- Avoid driver over-utilization
- Consider traffic, weather, and fuel costs
Always explain why a route or assignment is recommended.`,
    suggestionChips: ["Show truck maintenance alerts", "Optimize LAX -> PHX route", "Check TRUCK-05 allocation", "Driver HOS warnings"],
    initialMessage: "Fleet Operations Control Center online. I am prepared to assist with vehicle routing, driver schedules, predictive delay handling, and fuel optimizations. What is the current dispatch conflict?"
  },
  {
    id: "dispatch",
    name: "Dispatch & Operations Copilot",
    role: "Control Tower Operations Support",
    avatar: "📡",
    color: "var(--accent-purple)",
    systemPrompt: `You are a logistics dispatch operations copilot.
Assist operations teams with:
- Load assignment
- Delivery prioritization
- Route conflict resolution
- Delay handling
- Carrier coordination
- Exception management

Decision framework:
1. Prioritize urgent/late shipments.
2. Identify bottlenecks.
3. Recommend mitigation actions.
4. Suggest backup carriers if needed.
Always provide:
- Issue summary
- Root cause possibilities
- Recommended action
- Priority level (Low/Medium/High/Critical)`,
    suggestionChips: ["Analyze operational bottlenecks", "Prioritize TRK-9823 delay", "Suggest backup carrier for ORD", "List high urgency loads"],
    initialMessage: "Logistics Control Tower operational. Provide the current load conflicts, routing issues, or carrier capacity exceptions. I will provide structured resolutions with priority tags."
  },
  {
    id: "pricing",
    name: "Sales & Freight Quotation Bot",
    role: "Lead Generation & Rates Estimator",
    avatar: "💰",
    color: "var(--accent-green)",
    systemPrompt: `You are a freight quotation assistant for a logistics company.
Help customers obtain shipping estimates.
Collect:
- Pickup location
- Delivery destination
- Shipment weight
- Dimensions
- Cargo type
- FTL or LTL
- Delivery urgency
- Hazardous material status

Then:
- Suggest shipping options
- Explain tradeoffs (cost vs speed)
- Recommend best option
Never provide fake pricing. If rates are unavailable, collect lead details for sales follow-up.`,
    suggestionChips: ["Quote LTL: NY to LA, 500 lbs", "FTL rate Chicago to Boston", "HAZMAT pricing rules", "Request custom rate card"],
    initialMessage: "Hello! I can compile freight estimates. To start, please provide the pickup location, delivery destination, shipment weight, dims, urgency level, and if the cargo is HAZMAT."
  },
  {
    id: "warehouse",
    name: "Warehouse Support Assistant",
    role: "WMS Inventory Operations Support",
    avatar: "🏬",
    color: "var(--accent-cyan)",
    systemPrompt: `You are a warehouse operations assistant.
Support warehouse teams with:
- Inventory queries
- Bin location lookup
- Picking/packing instructions
- Dock scheduling
- Inbound/outbound coordination
- SKU discrepancy handling

Always:
- Confirm SKU or shipment reference
- Recommend operational next steps
- Escalate inventory mismatches immediately.`,
    suggestionChips: ["Locate SKU-8820 in bin", "Check stock for SKU-3112", "Where is SKU-9045?", "Report inventory mismatch"],
    initialMessage: "Warehouse Management System (WMS) assistant ready. Provide the SKU, bin number, or dock appointment reference to proceed with warehouse operations."
  },
  {
    id: "delays",
    name: "Delay Resolution Specialist",
    role: "Logistics Customer Care Agent",
    avatar: "⚠️",
    color: "var(--accent-pink)",
    systemPrompt: `You are a logistics issue resolution specialist.
For delays, damages, missing shipments, or failed deliveries:
1. Gather:
   - Tracking ID
   - Delivery address
   - Shipment date
   - Issue description
2. Diagnose:
   - Transit delay
   - Weather disruption
   - Customs hold
   - Warehouse backlog
   - Carrier issue
3. Respond with:
   - Current situation
   - Estimated resolution timeline
   - Immediate next action
   - Escalation path if needed
Stay empathetic but operationally precise.`,
    suggestionChips: ["Resolve delay on TRK-9823", "Damaged cargo claim TRK-1002", "Customs hold resolving", "Escalate SLA breach"],
    initialMessage: "Issue Resolution desk. If you have a delayed, damaged, or lost shipment, please provide the Tracking ID, destination address, and description of the issue."
  },
  {
    id: "sop",
    name: "SOP/Knowledge Base Assistant",
    role: "Internal Compliance SOP Officer",
    avatar: "📋",
    color: "var(--text-secondary)",
    systemPrompt: `You are an internal logistics SOP assistant.
Help employees answer questions about:
- Standard operating procedures
- Carrier policies
- Claims handling
- Customs documentation
- Delivery compliance
- Safety guidelines

When answering:
- Cite the relevant SOP section if available.
- Do not make up policy details.
- Ask clarifying questions when context is missing.`,
    suggestionChips: ["Claims handling limit policy?", "Required border customs docs?", "Driver Hours of Service guidelines", "Cite SOP Section 4.2"],
    initialMessage: "Internal SOP compliance library loaded. Ask about our operating procedures, carrier liability limits, customs filings, or driver hours of service regulations."
  },
  {
    id: "orchestrator",
    name: "Multi-Agent Orchestrator",
    role: "Intelligent Routing Hub",
    avatar: "⚡",
    color: "var(--accent-purple)",
    systemPrompt: `You are an enterprise logistics AI assistant with specialized roles.
Switch dynamically between:
1. Customer Support Agent
2. Shipment Tracking Agent
3. Dispatch Coordinator
4. Fleet Analyst
5. Warehouse Assistant
6. Freight Pricing Advisor
7. Claims Resolution Specialist

Determine the user's intent first.
For every request:
- Identify issue type
- Ask for required shipment information
- Retrieve relevant logistics context
- Provide actionable resolution
- Escalate high-risk situations

Never hallucinate logistics data. Always distinguish between:
- Confirmed information
- Estimated information
- Missing information`,
    suggestionChips: ["Track TRK-9823 and find driver", "Quote NY to Boston and locate SKU-8820", "Claims policy on damaged TRK-1002", "Check truck fuels and warehouse capacity"],
    initialMessage: "Enterprise Multi-Agent Orchestrator online. I can parse composite requests, dynamically routing sub-intents to specialized agents (Tracking, Fleet, Pricing, Warehouse, Claims) to construct unified responses."
  }
];

// --- App State Variables ---
let currentAgent = AGENTS[0];
let activeTab = "shipments";
let isTracePanelCollapsed = false;

// --- DOM References ---
const agentListContainer = document.getElementById("agent-list-container");
const systemPromptEditor = document.getElementById("system-prompt-editor");
const paramTemp = document.getElementById("param-temp");
const tempVal = document.getElementById("temp-val");
const paramChunks = document.getElementById("param-chunks");
const chunksVal = document.getElementById("chunks-val");
const paramGuardrails = document.getElementById("param-guardrails");

const activeAgentTitle = document.getElementById("active-agent-title");
const activeAgentGlow = document.getElementById("active-agent-glow");
const chatHistoryContainer = document.getElementById("chat-history-container");
const suggestionChipsContainer = document.getElementById("suggestion-chips-container");
const chatInputField = document.getElementById("chat-input-field");
const btnSendMessage = document.getElementById("btn-send-message");
const btnClearChat = document.getElementById("btn-clear-chat");
const btnResetDb = document.getElementById("btn-reset-db");
const btnExport = document.getElementById("btn-export");

const dbTabs = document.querySelectorAll(".db-tab");
const dbContentPanel = document.getElementById("db-content-panel");
const activeAgentsCount = document.getElementById("active-agents-count");

const tracePanel = document.getElementById("trace-panel");
const traceToggleBar = document.getElementById("trace-toggle-bar");
const traceToggleArrow = document.getElementById("trace-toggle-arrow");
const traceNodesContainer = document.getElementById("trace-nodes-container");

const exportModalOverlay = document.getElementById("export-modal-overlay");
const btnCloseModal = document.getElementById("btn-close-modal");
const exportCodeBox = document.getElementById("export-code-box");
const btnCopyExport = document.getElementById("btn-copy-export");
const btnCopyPrompt = document.getElementById("btn-copy-prompt");
const toastNotify = document.getElementById("toast-notify");

// --- Initialize App ---
function init() {
  renderAgentsList();
  selectAgent(currentAgent.id);
  renderDatabaseTab(activeTab);
  addEventListeners();
  addInitialWelcomeMessage();
  updateHeaderStats();
}

// --- Render Left Side Agents ---
function renderAgentsList() {
  agentListContainer.innerHTML = "";
  AGENTS.forEach(agent => {
    const card = document.createElement("button");
    card.className = `agent-card ${agent.id === currentAgent.id ? 'active' : ''}`;
    card.setAttribute("data-id", agent.id);
    
    card.innerHTML = `
      <div class="agent-avatar" style="background-color: ${agent.id === currentAgent.id ? agent.color : ''}">${agent.avatar}</div>
      <div class="agent-info">
        <span class="agent-name">${agent.name}</span>
        <span class="agent-role">${agent.role}</span>
      </div>
    `;
    
    card.addEventListener("click", () => selectAgent(agent.id));
    agentListContainer.appendChild(card);
  });
}

// --- Select Active Agent ---
function selectAgent(id) {
  currentAgent = AGENTS.find(a => a.id === id);
  
  // Update left active list states
  document.querySelectorAll(".agent-card").forEach(card => {
    const cardId = card.getAttribute("data-id");
    const avatar = card.querySelector(".agent-avatar");
    if (cardId === id) {
      card.classList.add("active");
      avatar.style.backgroundColor = currentAgent.color;
      avatar.style.color = "white";
    } else {
      card.classList.remove("active");
      avatar.style.backgroundColor = "";
      avatar.style.color = "";
    }
  });

  // Update configurations pane
  systemPromptEditor.value = currentAgent.systemPrompt;
  
  // Update chat details
  activeAgentTitle.textContent = `${currentAgent.name} (${currentAgent.role})`;
  activeAgentGlow.style.backgroundColor = currentAgent.color;
  activeAgentGlow.style.boxShadow = `0 0 10px ${currentAgent.color}`;
  
  // Update Suggestion Chips
  renderSuggestionChips();
  
  // Add welcome message if chat history is empty or just initialized
  if (chatHistoryContainer.children.length === 0) {
    addInitialWelcomeMessage();
  } else {
    // Show a system announcement in the chat
    appendSystemAlert(`System redirected to: <strong>${currentAgent.name}</strong>`);
  }

  showToast(`Loaded ${currentAgent.name} Persona`);
}

// --- Render suggestion chips ---
function renderSuggestionChips() {
  suggestionChipsContainer.innerHTML = "";
  currentAgent.suggestionChips.forEach(chipText => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = chipText;
    chip.addEventListener("click", () => {
      chatInputField.value = chipText;
      chatInputField.focus();
    });
    suggestionChipsContainer.appendChild(chip);
  });
}

// --- Render Welcome Message ---
function addInitialWelcomeMessage() {
  chatHistoryContainer.innerHTML = "";
  appendChatMessage("bot", currentAgent.initialMessage, currentAgent.name, currentAgent.avatar);
}

// --- Send Chat Message ---
function sendMessage() {
  const query = chatInputField.value.trim();
  if (!query) return;
  
  // Display User Message
  appendChatMessage("user", query, "You", "👤");
  chatInputField.value = "";
  
  // Trigger reasoning & show bot response
  simulateAIResponse(query);
}

// --- Append message bubble to chat ---
function appendChatMessage(sender, text, name, avatar, widgetHtml = "") {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = `msg-wrapper ${sender}`;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  msgWrapper.innerHTML = `
    <div class="msg-meta">${name} &bull; ${time}</div>
    <div class="msg-bubble">${text}</div>
    ${widgetHtml}
  `;
  
  chatHistoryContainer.appendChild(msgWrapper);
  chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
}

// --- Append system warning/update message ---
function appendSystemAlert(htmlContent) {
  const alertDiv = document.createElement("div");
  alertDiv.style.alignSelf = "center";
  alertDiv.style.margin = "8px 0";
  alertDiv.style.fontSize = "0.7rem";
  alertDiv.style.color = "var(--text-muted)";
  alertDiv.style.background = "var(--bg-surface)";
  alertDiv.style.border = "1px solid var(--border-color)";
  alertDiv.style.padding = "4px 12px";
  alertDiv.style.borderRadius = "100px";
  alertDiv.innerHTML = htmlContent;
  chatHistoryContainer.appendChild(alertDiv);
  chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
}

// --- Expand/Collapse Trace Panel ---
function toggleTracePanel(collapse) {
  isTracePanelCollapsed = collapse !== undefined ? collapse : !isTracePanelCollapsed;
  if (isTracePanelCollapsed) {
    tracePanel.classList.add("collapsed");
    traceToggleArrow.style.transform = "rotate(0deg)";
  } else {
    tracePanel.classList.remove("collapsed");
    traceToggleArrow.style.transform = "rotate(180deg)";
  }
}

// --- Simulate Cognitive Routing & RAG Logic ---
function simulateAIResponse(query) {
  // 1. Expand Trace Panel to show thinking steps
  toggleTracePanel(false);
  
  // Setup loading indicator in chat
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";
  typingIndicator.id = "live-typing-indicator";
  typingIndicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chatHistoryContainer.appendChild(typingIndicator);
  chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
  
  // 2. Perform mock intent routing and RAG query
  const searchResults = queryRAG(query);
  const activePromptText = systemPromptEditor.value;
  
  // 3. Render animated Reasoning Trace
  renderReasoningTrace(query, searchResults);

  // 4. Simulate response typing latency
  setTimeout(() => {
    // Remove typing indicator
    const indicator = document.getElementById("live-typing-indicator");
    if (indicator) indicator.remove();
    
    // Generate simulated intelligent response text
    const responseData = generateResponseText(query, searchResults, activePromptText);
    
    // Append answer to Chat
    appendChatMessage(
      "bot", 
      responseData.text, 
      currentAgent.name, 
      currentAgent.avatar, 
      responseData.widgetHtml
    );
  }, 1200);
}

// --- Core Query Parser & Data Matcher (Simulating RAG / CRM Query) ---
function queryRAG(query) {
  const normQuery = query.toLowerCase();
  let matches = {
    shipments: [],
    fleet: [],
    warehouse: [],
    rates: [],
    sops: [],
    matchedIntent: "general"
  };
  
  // Match shipments
  DB.shipments.forEach(s => {
    if (normQuery.includes(s.id.toLowerCase()) || 
        normQuery.includes(s.origin.toLowerCase().split(" ")[0]) || 
        normQuery.includes(s.destination.toLowerCase().split(" ")[0])) {
      matches.shipments.push(s);
    }
  });

  // Match fleet
  DB.fleet.forEach(f => {
    if (normQuery.includes(f.truck.toLowerCase()) || 
        normQuery.includes(f.driver.toLowerCase().split(" ")[0]) || 
        normQuery.includes(f.driver.toLowerCase().split(" ")[1] || "")) {
      matches.fleet.push(f);
    }
  });

  // Match WMS inventory
  DB.warehouse.forEach(w => {
    if (normQuery.includes(w.sku.toLowerCase()) || normQuery.includes(w.name.toLowerCase().split(" ")[0])) {
      matches.warehouse.push(w);
    }
  });

  // Match SOP Rules
  DB.sops.forEach(sop => {
    if (normQuery.includes(sop.key) || normQuery.includes("sop") || normQuery.includes("policy") || normQuery.includes("guidelines") || normQuery.includes("claims") || normQuery.includes("customs") || normQuery.includes("safety")) {
      if (normQuery.includes("claims") && sop.key === "claims") matches.sops.push(sop);
      else if (normQuery.includes("customs") && sop.key === "customs") matches.sops.push(sop);
      else if ((normQuery.includes("safety") || normQuery.includes("hours") || normQuery.includes("break")) && sop.key === "safety") matches.sops.push(sop);
      else if (normQuery.includes("sop") && !matches.sops.includes(sop)) matches.sops.push(sop);
    }
  });

  // Match Rates (Quotation keywords)
  if (normQuery.includes("quote") || normQuery.includes("rate") || normQuery.includes("cost") || normQuery.includes("price") || normQuery.includes("shipping estimate") || normQuery.includes("ftl") || normQuery.includes("ltl")) {
    matches.rates = [...DB.rates];
  }

  // --- Intent Classification (Useful for Orchestrator routing) ---
  if (normQuery.includes("track") || normQuery.includes("where is") || matches.shipments.length > 0) {
    matches.matchedIntent = "tracking";
  } else if (normQuery.includes("truck") || normQuery.includes("driver") || normQuery.includes("fleet") || matches.fleet.length > 0) {
    matches.matchedIntent = "fleet";
  } else if (normQuery.includes("bin") || normQuery.includes("sku") || normQuery.includes("warehouse") || matches.warehouse.length > 0) {
    matches.matchedIntent = "warehouse";
  } else if (normQuery.includes("quote") || normQuery.includes("price") || normQuery.includes("rate") || normQuery.includes("how much")) {
    matches.matchedIntent = "pricing";
  } else if (normQuery.includes("delay") || normQuery.includes("broken") || normQuery.includes("damaged") || normQuery.includes("missing")) {
    matches.matchedIntent = "delays";
  } else if (normQuery.includes("rule") || normQuery.includes("policy") || normQuery.includes("sop") || normQuery.includes("document")) {
    matches.matchedIntent = "sop";
  }

  return matches;
}

// --- Render bottom trace elements ---
function renderReasoningTrace(query, matches) {
  traceNodesContainer.innerHTML = "";
  
  // Node 1: Input Query Parsing
  createTraceNode("Input Processing", `"${query.substring(0, 15)}..."`, true);
  createTraceConnector(true);
  
  // Node 2: Intent Classification
  let matchedAgentName = "General Routing";
  if (currentAgent.id === "orchestrator") {
    const targetAgent = AGENTS.find(a => a.id === matches.matchedIntent);
    matchedAgentName = targetAgent ? `Orchestrator -> ${targetAgent.name}` : "Orchestrator Routing";
  } else {
    matchedAgentName = currentAgent.name;
  }
  createTraceNode("Intent Classifier", matchedAgentName, true);
  createTraceConnector(true);

  // Node 3: RAG Retrieval Status
  let dbHits = [];
  if (matches.shipments.length > 0) dbHits.push(`${matches.shipments.length} Shipments`);
  if (matches.fleet.length > 0) dbHits.push(`${matches.fleet.length} Trucks`);
  if (matches.warehouse.length > 0) dbHits.push(`${matches.warehouse.length} Inventory`);
  if (matches.sops.length > 0) dbHits.push(`${matches.sops.length} SOPs`);
  if (matches.rates.length > 0 && (query.toLowerCase().includes("quote") || query.toLowerCase().includes("rate"))) dbHits.push(`Rates Matrix`);
  
  const hitsText = dbHits.length > 0 ? `Hits: ${dbHits.join(", ")}` : "No direct matches (General KB)";
  createTraceNode("RAG Index Query", hitsText, dbHits.length > 0);
  createTraceConnector(true);

  // Node 4: Guardrail Inspection
  const guardrailsActive = paramGuardrails.checked;
  createTraceNode(
    "Guardrail Filter", 
    guardrailsActive ? "SLA Check: APPROVED" : "BYPASSED", 
    guardrailsActive
  );
  createTraceConnector(true);

  // Node 5: Output Generation
  createTraceNode("LLM Compiler", "Response Assembled", true);
}

function createTraceNode(label, subtext, active) {
  const node = document.createElement("div");
  node.className = `trace-node ${active ? 'active' : ''}`;
  node.innerHTML = `
    <span class="trace-node-label">${label}</span>
    <span class="trace-node-sub">${subtext}</span>
  `;
  traceNodesContainer.appendChild(node);
}

function createTraceConnector(pulse) {
  const conn = document.createElement("div");
  conn.className = `trace-connector ${pulse ? 'pulse' : ''}`;
  traceNodesContainer.appendChild(conn);
}

// --- Text Generator simulating LLM Prompts & workflow requirements ---
function generateResponseText(query, matches, systemPrompt) {
  const normQuery = query.toLowerCase();
  const activeAgentId = currentAgent.id;
  const guardrailsActive = paramGuardrails.checked;
  
  let text = "";
  let widgetHtml = "";
  
  // Decide what actual agent role is running. If orchestrator, we dynamically route to specialized prompt response!
  let actingAgentId = activeAgentId;
  if (activeAgentId === "orchestrator") {
    actingAgentId = matches.matchedIntent;
  }

  // --- 1. SHIPMENT TRACKING DESK ---
  if (actingAgentId === "tracking") {
    // Workflow rules: requires Tracking number.
    if (matches.shipments.length === 0) {
      text = "To track your cargo, please provide a valid 8-character Tracking ID (e.g. <strong>TRK-1002</strong>, <strong>TRK-9823</strong>, or <strong>TRK-4491</strong>) or your Order ID.";
    } else {
      const s = matches.shipments[0];
      
      // status translate rules:
      let plainStatus = s.status;
      if (s.status === "Delivered") {
        plainStatus = `Your shipment has arrived safely at <strong>${s.location}</strong> and is fully signed off by the carrier.`;
      } else if (s.status === "Delayed") {
        plainStatus = `Your shipment is currently delayed at <strong>${s.location}</strong>. ${s.details} Updated ETA is <strong>${s.eta}</strong>.`;
      } else {
        plainStatus = `Your shipment is currently in transit, passing through <strong>${s.location}</strong>. Route timeline is progressing normally.`;
      }

      text = `Retrieved logs for Shipment Reference <strong>${s.id}</strong> (Carrier: ${s.carrier}):<br><br>
              &bull; <strong>Current Status</strong>: ${plainStatus}<br>
              &bull; <strong>Origin/Dest</strong>: ${s.origin} &rarr; ${s.destination}<br>
              &bull; <strong>Weight / Urgency</strong>: ${s.weight} / ${s.urgency}<br>
              &bull; <strong>Estimated Delivery</strong>: ${s.eta}`;
      
      // Timeline HTML Widget
      const isDelivered = s.status === "Delivered";
      const isDelayed = s.status === "Delayed";
      
      widgetHtml = `
        <div class="widget-card">
          <div class="widget-title">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m12 6-2 6h4l-2 6"/></svg>
            Shipment Transit Logs (Live Track)
          </div>
          <div class="timeline">
            <div class="timeline-step completed">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-time">Origin Hub Gate</span>
                <span class="timeline-desc">Dispatched from ${s.origin}</span>
              </div>
            </div>
            <div class="timeline-step ${isDelivered || isDelayed ? 'completed' : 'active'}">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-time">Transit Facility</span>
                <span class="timeline-desc">${isDelayed ? 'Delayed: Transit Hold' : 'Sorted through ' + s.location}</span>
              </div>
            </div>
            <div class="timeline-step ${isDelivered ? 'completed' : (isDelayed ? 'active' : '')}">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-time">Destination Delivery</span>
                <span class="timeline-desc">${isDelivered ? 'Signed & Delivered' : 'Estimated Arrival: ' + s.eta}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }
  
  // --- 2. FLEET OPERATIONS DESK ---
  else if (actingAgentId === "fleet") {
    if (matches.fleet.length === 0) {
      text = `I can help dispatchers allocate vehicles, optimize route layouts, review scheduling compliance, or check maintenance. 
              <br><br><strong>Simulated Fleet:</strong> We have <strong>TRUCK-05</strong> (Marcus Vance), <strong>TRUCK-12</strong> (Elena Rostova), and <strong>TRUCK-29</strong> (Davis K.) active in current logs.`;
    } else {
      const f = matches.fleet[0];
      let analysisText = "";
      
      if (f.status === "Needs Fuel") {
        analysisText = `⚠️ <strong>Alert:</strong> Fuel levels are dangerously low (${f.fuel}). 
                        <br><strong>Recommendation:</strong> Instruct driver <strong>${f.driver}</strong> to divert immediately to the nearest partner terminal on the LAX-PHX route (Pilot Flyer, exit 112). Avoid dispatching further load assignments.`;
      } else {
        analysisText = `Driver <strong>${f.driver}</strong> is in compliance with HOS rules. Truck <strong>${f.truck}</strong> is currently <strong>${f.status}</strong> with a cargo volume of <strong>${f.load}</strong>.`;
      }

      text = `Fleet allocation and routing logs for <strong>${f.truck}</strong>:<br><br>
              &bull; <strong>Assigned Driver</strong>: ${f.driver}<br>
              &bull; <strong>Scheduled Route</strong>: ${f.route}<br>
              &bull; <strong>Telemetry Details</strong>: Fuel ${f.fuel} | Status: ${f.status}<br>
              &bull; <strong>Maintenance Logs</strong>: ${f.maintenance}<br><br>
              <strong>Dispatcher Decision Framework:</strong><br>
              ${analysisText}`;
    }
  }

  // --- 3. DISPATCH OPERATIONS DESK ---
  else if (actingAgentId === "dispatch") {
    // decision framework: prioritize urgent, identify bottlenecks, suggest backup carriers, assign priority tags.
    if (matches.shipments.length === 0 && matches.fleet.length === 0) {
      text = "Operational Tower ready. Please report any load delay exceptions or fleet route bottlenecks. For example, ask me to <strong>'Analyze operational bottlenecks'</strong> or <strong>'Prioritize TRK-9823 delay'</strong>.";
    } else {
      // Analyze shipment delay
      const s = matches.shipments.find(sh => sh.status === "Delayed") || DB.shipments[1];
      
      text = `<strong>OPERATIONAL CONTROL EXCEPTION LOG:</strong><br><br>
              &bull; <strong>Issue Summary</strong>: Cargo shipment <strong>${s.id}</strong> (Carrier: ${s.carrier}) is currently stuck at ${s.location} due to storm conditions.<br>
              &bull; <strong>Root Cause Possibilities</strong>: Severe weather blocking rail routes across Upper Midwest corridor, leading to local terminal backlog.<br>
              &bull; <strong>Recommended Action</strong>: Coordinate with RailLink logistics to confirm railcar restart schedule. If delivery window is breached (SLA past 24 hours), activate backup courier <strong>FedRoad Express</strong> for local truck diversion from Minneapolis depot to Chicago.<br><br>
              &bull; <strong>Operational Priority</strong>: <span class="tag tag-critical">CRITICAL (SLA Breach Risk)</span>`;
    }
  }

  // --- 4. SALES & FREIGHT RATES DESK ---
  else if (actingAgentId === "pricing") {
    // Requires: pickup, delivery, weight, dims, cargo type, FTL/LTL, urgency, HAZMAT.
    const hasWeight = normQuery.match(/\d+\s*(lbs|lb|pounds|kg)/i);
    const isLtl = normQuery.includes("ltl") || (hasWeight && parseInt(hasWeight[0]) < 8000);
    const isHazmat = normQuery.includes("hazmat") || normQuery.includes("hazardous");
    
    // Check if we can calculate
    const hasLocations = (normQuery.includes("ny") || normQuery.includes("york") || normQuery.includes("la") || normQuery.includes("angeles") || normQuery.includes("chicago") || normQuery.includes("boston"));

    if (!hasLocations) {
      text = `I am ready to compile shipping estimates. To provide an accurate quotation, please detail:
              <br>1. Pickup and delivery points (e.g., Boston to NY)
              <br>2. Cargo details (Weight in lbs, volume dimensions)
              <br>3. Mode type (FTL/LTL)
              <br>4. Hazardous material status (HAZMAT)
              <br>5. Urgency level (Standard vs Priority)`;
    } else {
      // Rates calculations
      let parsedWeight = 500;
      if (hasWeight) {
        parsedWeight = parseInt(hasWeight[0].replace(/\D/g, ''));
      }
      
      let baseLtlRate = 1.25; // standard rate per lb
      let calcPrice = Math.round(parsedWeight * baseLtlRate);
      if (isHazmat) calcPrice += 250;
      
      let priorityPrice = Math.round(calcPrice * 2.2);

      text = `Freight Pricing Summary for cargo weighing <strong>${parsedWeight} lbs</strong> ${isHazmat ? '(HAZMAT Surcharge Applied)' : ''}:<br><br>
              &bull; <strong>Service Recommendation</strong>: Recommended as <strong>${isLtl ? 'LTL (Less-than-Truckload)' : 'FTL (Full-Truckload)'}</strong> based on weight classification.<br>
              &bull; <strong>Guardrail Status</strong>: Pricing estimated using active carrier tariff templates. Final rate sheets require broker validation.<br><br>
              <strong>Trade-Off Matrix:</strong>`;

      widgetHtml = `
        <div class="pricing-grid">
          <div class="pricing-card recommended">
            <span class="pricing-card-type">Standard Economy (${isLtl ? 'LTL' : 'FTL'})</span>
            <span class="pricing-card-price">$${calcPrice}</span>
            <span class="pricing-card-speed">ETA: 3-5 Business Days</span>
          </div>
          <div class="pricing-card">
            <span class="pricing-card-type">Priority Express Air</span>
            <span class="pricing-card-price">$${priorityPrice}</span>
            <span class="pricing-card-speed">ETA: Next Day Delivery</span>
          </div>
        </div>
      `;
    }
  }

  // --- 5. WAREHOUSE MANAGEMENT SYSTEM DESK ---
  else if (actingAgentId === "warehouse") {
    // inventory lookup, Picking instructions, bin locations.
    if (matches.warehouse.length === 0) {
      text = "To fetch warehouse bin locations and item quantities, please reference a valid warehouse identifier SKU (e.g., <strong>SKU-8820</strong>, <strong>SKU-3112</strong>, or <strong>SKU-9045</strong>).";
    } else {
      const w = matches.warehouse[0];
      let actionRecommendation = "";
      
      if (w.qty === "0" || w.status === "Out of Stock") {
        actionRecommendation = `⚠️ <strong>Out of Stock Action:</strong> SKU-3112 is depleted. Coordinate with Procurement to review inbound purchase orders. Do not release picking orders for this item.`;
      } else if (w.status === "Reserved") {
        actionRecommendation = `🔒 <strong>Reserved Status:</strong> These solar inverters are allocated to Outbound Dock #4. Verify project order reference before staging.`;
      } else {
        actionRecommendation = `📦 <strong>Pick Instruction:</strong> SKU-8820 is available in row B, bin 14-3. Use standard pallet jack to retrieve. Confirm count of ${w.qty} pcs after completion.`;
      }

      text = `Inventory Bin Lookup for SKU: <strong>${w.sku}</strong> (WMS Record):<br><br>
              &bull; <strong>Product Name</strong>: ${w.name}<br>
              &bull; <strong>Bin Location</strong>: <span style="background-color: var(--border-color); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600;">${w.bin}</span><br>
              &bull; <strong>Available Qty</strong>: ${w.qty} ${w.unit}<br>
              &bull; <strong>Stock Status</strong>: ${w.status} (${w.weight}/unit)<br><br>
              <strong>Operational Next Step:</strong><br>
              ${actionRecommendation}`;
    }
  }

  // --- 6. DELAY RESOLUTION SPECIALIST ---
  else if (actingAgentId === "delays") {
    // 1. Gather tracking, address, date, issue. 2. Diagnose weather/customs/carrier. 3. Respond with situation, ETA, next steps, escalation.
    if (matches.shipments.length === 0) {
      text = "I am ready to troubleshoot delays, customs issues, or damaged goods. Please provide your Tracking ID (e.g. <strong>TRK-9823</strong>) to begin the diagnostic workflow.";
    } else {
      const s = matches.shipments[0];
      let diagnosis = "";
      let etaVal = s.eta;
      let action = "";
      let escalation = "";

      if (s.status === "Delayed") {
        diagnosis = "Transit delay triggered by severe blizzard storms halting cargo rail paths.";
        action = "Instruct carrier dispatcher to monitor rail re-opening schedules. Customer notifications triggered.";
        escalation = "If cargo is delayed past SLA (June 18), contact VP of Carrier Operations for freight diversion.";
      } else if (s.status === "Delivered") {
        diagnosis = "Delivery completed. Recipient marked as signed at cargo destination terminal.";
        action = "No pending delays. Proof of Delivery (POD) documents are archived in carrier databases.";
        escalation = "If physical discrepancies are found at warehouse unpacking, file damage log within 48 hours.";
      } else {
        diagnosis = "Customs holding or transit bottleneck check active at border crossings.";
        action = "Confirm packing manifest lists are uploaded to customs portals.";
        escalation = "Contact border brokerage agents if clearance logs are not stamped within 12 hours.";
      }

      text = `<strong>DELAY & COMPLIANCE RESOLUTION FLOW:</strong><br><br>
              &bull; <strong>Reference ID</strong>: ${s.id} (Urgency: ${s.urgency})<br>
              &bull; <strong>Diagnosis</strong>: ${diagnosis}<br>
              &bull; <strong>Current Status</strong>: Active hold at ${s.location}<br>
              &bull; <strong>Resolution Timeline</strong>: Revised ETA: <strong>${etaVal}</strong><br>
              &bull; <strong>Immediate Action</strong>: ${action}<br>
              &bull; <strong>Escalation Path</strong>: ${escalation}`;
    }
  }

  // --- 7. SOP INTERNAL OFFICER ---
  else if (actingAgentId === "sop") {
    if (matches.sops.length === 0) {
      text = `I can consult our internal company policies and handbook guidelines. 
              <br><br>Ask me about:
              <br>&bull; <strong>Claims Limits</strong> (SOP 4.2)
              <br>&bull; <strong>Customs Documentation Requirements</strong> (SOP 9.1)
              <br>&bull; <strong>Driver Safety Hours (HOS)</strong> (SOP 1.5)`;
    } else {
      const sop = matches.sops[0];
      text = `<strong>INTERNAL COMPLIANCE COMPASS CITATION:</strong><br><br>
              <strong>${sop.title}</strong><br><br>
              "${sop.text}"<br><br>
              <em>Note: Do not formulate alternative liability limits or fuel schedules. Consult VP Compliance if exceptions occur.</em>`;
    }
  }

  // --- 8. DEFAULT / GENERAL ASSISTANT ---
  else {
    // If we matched any database records, show a summary of what we found!
    let foundSomething = false;
    let summaryParts = [];

    if (matches.shipments.length > 0) {
      foundSomething = true;
      const s = matches.shipments[0];
      summaryParts.push(`Shipment <strong>${s.id}</strong> (Status: ${s.status}, ETA: ${s.eta})`);
    }
    if (matches.fleet.length > 0) {
      foundSomething = true;
      const f = matches.fleet[0];
      summaryParts.push(`Truck <strong>${f.truck}</strong> (Driver: ${f.driver}, Status: ${f.status})`);
    }
    if (matches.warehouse.length > 0) {
      foundSomething = true;
      const w = matches.warehouse[0];
      summaryParts.push(`WMS Inventory SKU <strong>${w.sku}</strong> (Bin Location: ${w.bin}, Qty: ${w.qty})`);
    }

    if (foundSomething) {
      text = `I detected logistics search terms in your request. Here are the active enterprise database hits matching your query:<br><br>
              &bull; ${summaryParts.join("<br>&bull; ")}<br><br>
              Please switch to specialized panels on the left to execute full workflows for tracking, dispatcher routing, or freight pricing.`;
    } else {
      text = `I'm here to help coordinate your logistics operation. 
              <br><br>You can ask me to track specific packages (e.g. <strong>'Track TRK-1002'</strong>), look up warehouse bin locations (e.g. <strong>'Check SKU-8820'</strong>), or request shipping rate cards.`;
    }
  }

  // --- RAG Guardrail override (Check if active agent does fake stats) ---
  if (guardrailsActive && normQuery.includes("fake")) {
    text = "⚠️ <strong>Guardrail Intercepted:</strong> The AI system prompt strictly forbids generating fake pricing rates or guessing tracking statuses. Please use official database variables.";
    widgetHtml = "";
  }

  return { text, widgetHtml };
}

// --- Render tab contents for Right Side Database (RAG Panel) ---
function renderDatabaseTab(tabName) {
  activeTab = tabName;
  
  // Highlight active tab
  document.querySelectorAll(".db-tab").forEach(tab => {
    if (tab.getAttribute("data-tab") === tabName) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  let tableHtml = "";

  if (tabName === "shipments") {
    tableHtml = `
      <div class="db-table-container">
        <div class="db-table-title">
          <span>SHIPMENTS DATABASE (ERP / CRM)</span>
          <span class="db-status-badge">Live Sync</span>
        </div>
        <table class="db-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Dest</th>
              <th>Status</th>
              <th>Carrier</th>
              <th>ETA</th>
            </tr>
          </thead>
          <tbody>
            ${DB.shipments.map((s, idx) => `
              <tr>
                <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-orange);">${s.id}</td>
                <td><span class="editable-cell" contenteditable="true" data-type="shipments" data-idx="${idx}" data-field="destination">${s.destination}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="shipments" data-idx="${idx}" data-field="status" style="font-weight:600;">${s.status}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="shipments" data-idx="${idx}" data-field="carrier">${s.carrier}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="shipments" data-idx="${idx}" data-field="eta">${s.eta}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  else if (tabName === "fleet") {
    tableHtml = `
      <div class="db-table-container">
        <div class="db-table-title">
          <span>FLEET OPS DISPATCH DATABASE</span>
          <span class="db-status-badge">Telematic Feed</span>
        </div>
        <table class="db-table">
          <thead>
            <tr>
              <th>Truck</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Fuel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${DB.fleet.map((f, idx) => `
              <tr>
                <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-blue);">${f.truck}</td>
                <td><span class="editable-cell" contenteditable="true" data-type="fleet" data-idx="${idx}" data-field="driver">${f.driver}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="fleet" data-idx="${idx}" data-field="route">${f.route}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="fleet" data-idx="${idx}" data-field="fuel">${f.fuel}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="fleet" data-idx="${idx}" data-field="status" style="font-weight:600;">${f.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  else if (tabName === "warehouse") {
    tableHtml = `
      <div class="db-table-container">
        <div class="db-table-title">
          <span>WMS INVENTORY (STOCK LOGS)</span>
          <span class="db-status-badge">Picking Active</span>
        </div>
        <table class="db-table">
          <thead>
            <tr>
              <th>SKU ID</th>
              <th>Item Name</th>
              <th>Bin</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${DB.warehouse.map((w, idx) => `
              <tr>
                <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan);">${w.sku}</td>
                <td><span class="editable-cell" contenteditable="true" data-type="warehouse" data-idx="${idx}" data-field="name">${w.name}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="warehouse" data-idx="${idx}" data-field="bin" style="font-family: var(--font-mono);">${w.bin}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="warehouse" data-idx="${idx}" data-field="qty" style="font-weight: 600;">${w.qty}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="warehouse" data-idx="${idx}" data-field="status">${w.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  else if (tabName === "rates") {
    tableHtml = `
      <div class="db-table-container">
        <div class="db-table-title">
          <span>FREIGHT RATE MATRIX</span>
          <span class="db-status-badge">Fuel Surcharges Tied</span>
        </div>
        <table class="db-table">
          <thead>
            <tr>
              <th>Service Class</th>
              <th>Pricing Formula</th>
              <th>Transit Speed</th>
            </tr>
          </thead>
          <tbody>
            ${DB.rates.map((r, idx) => `
              <tr>
                <td style="font-weight: 600; color: var(--accent-green);">${r.service}</td>
                <td><span class="editable-cell" contenteditable="true" data-type="rates" data-idx="${idx}" data-field="rate">${r.rate}</span></td>
                <td><span class="editable-cell" contenteditable="true" data-type="rates" data-idx="${idx}" data-field="speed">${r.speed}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  else if (tabName === "sops") {
    tableHtml = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${DB.sops.map((sop, idx) => `
          <div class="sop-card">
            <div class="sop-title">${sop.title}</div>
            <div class="sop-body" contenteditable="true" data-type="sops" data-idx="${idx}" data-field="text">${sop.text}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  dbContentPanel.innerHTML = tableHtml;
  attachCellEditListeners();
}

// --- Listen to database grid edits ---
function attachCellEditListeners() {
  const cells = dbContentPanel.querySelectorAll("[contenteditable=true]");
  
  cells.forEach(cell => {
    cell.addEventListener("blur", (e) => {
      const type = e.target.getAttribute("data-type");
      const idx = parseInt(e.target.getAttribute("data-idx"));
      const field = e.target.getAttribute("data-field");
      const value = e.target.textContent.trim();

      // Sync with internal DB object
      DB[type][idx][field] = value;
      
      // Update UI and trigger toast message
      showToast(`Database synced: ${type.toUpperCase()}[${idx}].${field} &rarr; "${value}"`);
      updateHeaderStats();
    });

    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
      }
    });
  });
}

// --- Reset Database Values ---
function resetDatabase() {
  DB = JSON.parse(JSON.stringify(INITIAL_DB));
  renderDatabaseTab(activeTab);
  showToast("Enterprise databases reset to default values.");
  appendSystemAlert("⚠️ <strong>System Alert:</strong> Logistics database records have been reset.");
}

// --- Header Stats Display ---
function updateHeaderStats() {
  // Count how many SKUs, shipments, drivers we have
  const totalCount = DB.shipments.length + DB.fleet.length + DB.warehouse.length;
  activeAgentsCount.textContent = `9/9 (DB items: ${totalCount})`;
}

// --- Show Toast Warning/Confirm ---
let toastTimeout;
function showToast(msg) {
  clearTimeout(toastTimeout);
  toastNotify.textContent = msg;
  toastNotify.classList.add("active");
  
  toastTimeout = setTimeout(() => {
    toastNotify.classList.remove("active");
  }, 2500);
}

// --- Copy system prompt ---
function copyPromptToClipboard() {
  navigator.clipboard.writeText(systemPromptEditor.value)
    .then(() => showToast("Persona Prompt Copied to Clipboard!"))
    .catch(() => showToast("Failed to copy prompt."));
}

// --- Export Config Modal Action ---
function openExportModal() {
  const payload = {
    meta: {
      client: "Lumina Logistics AI Simulator",
      exportTime: new Date().toISOString(),
      agentEngine: "Enterprise Multi-Agent Router v2.4",
      activeAgent: currentAgent.id,
      parameters: {
        temperature: parseFloat(paramTemp.value),
        contextSize: parseInt(paramChunks.value),
        guardrailsEnforced: paramGuardrails.checked
      }
    },
    systemPrompts: AGENTS.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      prompt: a.id === currentAgent.id ? systemPromptEditor.value : a.systemPrompt
    })),
    liveDatabaseSnapshot: DB
  };

  exportCodeBox.textContent = JSON.stringify(payload, null, 2);
  exportModalOverlay.classList.add("active");
}

function copyExportJson() {
  navigator.clipboard.writeText(exportCodeBox.textContent)
    .then(() => {
      showToast("Config JSON copied to clipboard!");
      exportModalOverlay.classList.remove("active");
    })
    .catch(() => showToast("Failed to copy config."));
}

// --- Event Handlers Setup ---
function addEventListeners() {
  // Sending messages
  btnSendMessage.addEventListener("click", sendMessage);
  chatInputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Prompt Tuning Sliders
  paramTemp.addEventListener("input", (e) => {
    tempVal.textContent = e.target.value;
  });
  paramChunks.addEventListener("input", (e) => {
    chunksVal.textContent = e.target.value;
  });
  
  // Custom Persona updates
  systemPromptEditor.addEventListener("blur", () => {
    currentAgent.systemPrompt = systemPromptEditor.value;
    showToast(`Persona prompt updated for ${currentAgent.name}`);
  });

  // Copy Prompt Button
  btnCopyPrompt.addEventListener("click", copyPromptToClipboard);

  // Clear Chat Button
  btnClearChat.addEventListener("click", () => {
    chatHistoryContainer.innerHTML = "";
    showToast("Chat logs cleared.");
    appendSystemAlert("Chat history cleared.");
  });

  // Reset DB Button
  btnResetDb.addEventListener("click", resetDatabase);

  // Export Modal Buttons
  btnExport.addEventListener("click", openExportModal);
  btnCloseModal.addEventListener("click", () => exportModalOverlay.classList.remove("active"));
  exportModalOverlay.addEventListener("click", (e) => {
    if (e.target === exportModalOverlay) exportModalOverlay.classList.remove("active");
  });
  btnCopyExport.addEventListener("click", copyExportJson);

  // Trace Toggle
  traceToggleBar.addEventListener("click", () => toggleTracePanel());

  // Database Tab Switching
  dbTabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      const targetTab = e.target.getAttribute("data-tab");
      renderDatabaseTab(targetTab);
    });
  });
}

// Start Simulator
window.addEventListener("DOMContentLoaded", init);
