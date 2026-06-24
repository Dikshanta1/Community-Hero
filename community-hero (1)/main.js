import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCUDjK41vbaFbRTy6biKg7xI7QQ8_nbzu0",
  authDomain: "community-hero-3819d.firebaseapp.com",
  projectId: "community-hero-3819d",
  storageBucket: "community-hero-3819d.firebasestorage.app",
  messagingSenderId: "489684122984",
  appId: "1:489684122984:web:621ab23493e6759dac2add",
  measurementId: "G-XML66V2JSK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Leaflet Map
const map = L.map('map', { zoomControl: false }).setView([28.6139, 77.2090], 12);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);

const mapMarkers = {};

// DOM Elements
const modal = document.getElementById('report-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const form = document.getElementById('report-form');
const processingState = document.getElementById('processing-state');

// Stats
const statReports = document.getElementById('stat-reports');
const statMoney = document.getElementById('stat-money');
let totalReports = 0;

// Modal Handlers
const openModal = () => { modal.style.display = 'flex'; };
const closeModal = () => { 
  modal.style.display = 'none'; 
  form.reset();
  form.style.display = 'block';
  processingState.style.display = 'none';
};

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Make the functions globally accessible so inline event listeners can find them
window.advanceStatus = async (id, nextStatus) => {
  try {
    await updateDoc(doc(db, 'civic_issues', id), { status: nextStatus });
  } catch (err) {
    console.error("Error updating status:", err);
  }
};

window.deleteReport = async (id) => {
  try {
    await deleteDoc(doc(db, 'civic_issues', id));
  } catch (err) {
    console.error("Error deleting report:", err);
  }
};

// Form Submission => Simulated Multi-Agent Delay => Firestore
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('issue-title').value;
  const description = document.getElementById('issue-desc').value;
  const category = document.getElementById('issue-category').value;

  form.style.display = 'none';
  processingState.style.display = 'flex';

  try {
    // 1. Simulate the Multi-Agent Negotiation with a realistic processing delay (2.5s)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 2. Generate a structured decision payload matching the exact specified schema
    const hazardLevel = Math.floor(Math.random() * 6) + 5; // Dynamic hazard level 5 to 10
    const calculatedImpactScore = parseFloat((hazardLevel * 1.2).toFixed(1));

    // Generate strict safety containment protocols for the Dispatch Agent
    const protocolTemplates = [
      "Erect physical barricades 50m from hazard; deploy emergency containment team.",
      "Cordon off surrounding active zone; broadcast immediate citizen safety alerts.",
      "Deploy localized emergency hazard mitigation kit; dispatch priority crew."
    ];
    const formalMunicipalComplaint = hazardLevel >= 8 
      ? `CRITICAL RISK. ${protocolTemplates[0]}`
      : protocolTemplates[Math.floor(Math.random() * protocolTemplates.length)];

    // Randomize lat/lng slightly around Delhi center to scatter nicely on the Leaflet map
    const lat = 28.6139 + (Math.random() - 0.5) * 0.08;
    const lng = 77.2090 + (Math.random() - 0.5) * 0.08;

    const simulatedData = {
      title: title,
      description: description,
      status: "In AI Verification",
      validationAgent: {
        isValid: true
      },
      prioritizationAgent: {
        hazardLevel: hazardLevel,
        calculatedImpactScore: calculatedImpactScore
      },
      dispatchAgent: {
        assignedDepartment: category,
        formalMunicipalComplaint: formalMunicipalComplaint
      },
      lat: lat,
      lng: lng,
      createdAt: new Date().toISOString()
    };

    // 3. Save directly to Firestore 'civic_issues' collection
    await addDoc(collection(db, 'civic_issues'), simulatedData);

    closeModal();
  } catch (err) {
    console.error("Error submitting report:", err);
    alert("There was an error communicating with the AI dispatch center.");
    closeModal();
  }
});

// Real-time Firestore Listener
onSnapshot(collection(db, 'civic_issues'), (snapshot) => {
  const colVerification = document.getElementById('col-verification');
  const colDispatched = document.getElementById('col-dispatched');
  const colResolved = document.getElementById('col-resolved');
  
  colVerification.innerHTML = '';
  colDispatched.innerHTML = '';
  colResolved.innerHTML = '';

  totalReports = snapshot.size;
  statReports.textContent = totalReports;
  statMoney.textContent = '$' + (totalReports * 1250).toLocaleString();

  const currentIds = new Set();

  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;
    currentIds.add(id);
    
    // Kanban Card
    const hazardLevel = data.prioritizationAgent?.hazardLevel || 1;
    const isSevere = hazardLevel >= 8;
    const cardClass = isSevere 
      ? "glass p-3 rounded-lg pulse-red border border-neon-red relative bg-black/60 transition-all duration-300" 
      : "glass p-3 rounded-lg border border-white/10 relative bg-black/40 transition-all duration-300";
    
    // Determine dynamic action buttons for interactive simulation
    let actionBtnHtml = '';
    const status = data.status || 'In AI Verification';
    if (status === 'In AI Verification') {
      actionBtnHtml = `
        <button onclick="advanceStatus('${id}', 'Dispatched & Route-Optimized')" class="w-full mt-3 bg-neon-blue/10 hover:bg-neon-blue/30 text-neon-blue border border-neon-blue/40 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition-all cursor-pointer">
          Optimize & Dispatch
        </button>
      `;
    } else if (status === 'Dispatched & Route-Optimized' || status === 'Dispatched') {
      actionBtnHtml = `
        <button onclick="advanceStatus('${id}', 'Resolved')" class="w-full mt-3 bg-neon-green/10 hover:bg-neon-green/30 text-neon-green border border-neon-green/40 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition-all cursor-pointer">
          Mark as Resolved
        </button>
      `;
    } else if (status === 'Resolved' || status === 'resolved') {
      actionBtnHtml = `
        <button onclick="deleteReport('${id}')" class="w-full mt-3 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded transition-all cursor-pointer">
          Archive Report
        </button>
      `;
    }

    const cardHtml = `
      <div class="${cardClass}">
        <div class="flex justify-between items-start mb-2">
          <span class="text-[9px] font-mono uppercase bg-white/10 px-1.5 py-0.5 rounded text-white border border-white/20">${data.dispatchAgent?.assignedDepartment || 'Unknown'}</span>
          <span class="text-[9px] font-mono font-bold ${isSevere ? 'text-neon-red neon-text-red' : 'text-neon-blue'}">SEV: ${hazardLevel}/10</span>
        </div>
        <h4 class="text-sm font-bold text-white mb-1 leading-tight">${data.title}</h4>
        <p class="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">${data.description}</p>
        <div class="text-[9px] font-mono text-gray-400 bg-black/80 p-2 rounded border border-white/10">
          <span class="text-neon-blue block mb-1 uppercase">Dispatch Orders:</span>
          > ${data.dispatchAgent?.formalMunicipalComplaint || 'Awaiting dispatch instructions'}
        </div>
        ${actionBtnHtml}
      </div>
    `;

    // Column logic mapping
    if (status === 'Resolved' || status === 'resolved') {
      colResolved.insertAdjacentHTML('beforeend', cardHtml);
    } else if (status === 'Dispatched' || status === 'Dispatched & Route-Optimized') {
      colDispatched.insertAdjacentHTML('beforeend', cardHtml);
    } else {
      colVerification.insertAdjacentHTML('beforeend', cardHtml);
    }

    // Map Marker logic
    if (data.lat && data.lng) {
      if (!mapMarkers[id]) {
        const markerColor = isSevere ? '#ff073a' : '#0ff';
        const pulseClass = isSevere ? 'animate-pulse' : '';
        
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="${pulseClass}" style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 15px ${markerColor}; border: 2px solid #fff;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        mapMarkers[id] = L.marker([data.lat, data.lng], { icon: customIcon }).addTo(map)
          .bindPopup(`
            <div style="font-family: monospace; font-size: 11px; background: #0f1419; color: #fff; padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
              <strong style="color: ${markerColor}; display: block; margin-bottom: 2px;">SEV: ${hazardLevel}/10 (${data.dispatchAgent?.assignedDepartment || 'Hazard'})</strong>
              <span style="color: #fff; font-weight: bold; font-size: 12px; display: block; margin-bottom: 4px;">${data.title}</span>
              <span style="color: #888; font-size: 10px; display: block;">${data.description.substring(0, 60)}...</span>
            </div>
          `, { className: 'custom-leaflet-popup' });
      } else {
        mapMarkers[id].setLatLng([data.lat, data.lng]);
      }
    }
  });

  // Cleanup old markers
  Object.keys(mapMarkers).forEach(key => {
    if (!currentIds.has(key)) {
      map.removeLayer(mapMarkers[key]);
      delete mapMarkers[key];
    }
  });
});
