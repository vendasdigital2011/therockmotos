'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Bike,
  Users,
  DollarSign,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Clock,
  AlertCircle,
  FileText,
  Sparkles,
  ExternalLink,
  Store,
  HelpCircle,
  Bell,
  CheckCircle2,
  Phone,
  BadgeCheck,
  Printer,
  HandCoins,
  Repeat,
  Receipt,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  UserPlus,
  Contact,
  Wrench,
  Building2,
  MapPin,
  Mail,
  UserCheck,
  Calendar,
  Camera,
  CheckSquare,
  FileCheck,
  Gauge,
  Layers,
  Tag,
  Trash2,
  Check,
  AlertTriangle,
  Landmark,
  Wallet,
  CreditCard,
  TrendingDown,
  PieChart,
  Percent,
  MessageSquare,
  Send,
  CalendarCheck,
  UserX,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Home,
  Folder,
  Briefcase,
  Bookmark,
  Filter,
  Globe,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

import PortalsTab from '@/components/admin/PortalsTab';
import FiscalRenaveTab from '@/components/admin/FiscalRenaveTab';
import ServicesWarrantyTab from '@/components/admin/ServicesWarrantyTab';
import DataImportTab from '@/components/admin/DataImportTab';
import SystemHealthTab from '@/components/admin/SystemHealthTab';

interface MotorcycleCost {
  id: string;
  category: string;
  description: string;
  amount: number;
  isCredit?: boolean;
  status?: string;
  date: string;
  createdByName?: string;
  supplier?: { id: string; name: string; tradeName?: string; roles: string; phone: string };
}

interface MotorcycleTask {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
  costEstimate?: number;
  completedAt?: string;
  partner?: { id: string; name: string; tradeName?: string; roles: string; phone: string };
}

interface MotorcycleStatusHistory {
  id: string;
  fromStatus: string;
  toStatus: string;
  reason?: string;
  userName?: string;
  createdAt: string;
}

interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  version?: string;
  plate: string;
  yearMfg: number;
  yearModel: number;
  color: string;
  mileage: number;
  fuel?: string;
  displacement?: number;
  chassis?: string;
  renavam?: string;
  ownership?: string;
  condition?: string;
  status: string;
  publicPrice: number;
  fipeCode?: string;
  fipeValue?: number;
  fipeRefMonth?: string;
  location: string;
  imageUrl?: string;
  images?: string;
  features?: string;
  description?: string;
  entryDate: string;
  supplier?: { id: string; name: string; tradeName?: string; document?: string; phone: string };
  costs?: MotorcycleCost[];
  tasks?: MotorcycleTask[];
  statusHistory?: MotorcycleStatusHistory[];
}

interface LeadInteraction {
  id: string;
  type: string;
  description: string;
  authorName?: string;
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: string;
  stage: string;
  budget?: number;
  lossReason?: string;
  nextAction?: string;
  nextActionDate?: string;
  notes?: string;
  createdAt: string;
  motorcycle?: { id: string; brand: string; model: string; plate: string; publicPrice?: number };
  assignedTo?: { id: string; name: string; email: string };
  interactions?: LeadInteraction[];
  activities?: any[];
}

interface Sale {
  id: string;
  saleDate: string;
  salePrice: number;
  costBasis: number;
  grossProfit: number;
  paymentType: string;
  entryAmount?: number;
  financedAmount?: number;
  tradeInAmount?: number;
  tradeInPlate?: string;
  tradeInModel?: string;
  notes?: string;
  motorcycle: {
    id: string;
    brand: string;
    model: string;
    plate: string;
    yearMfg: number;
    yearModel: number;
    color: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    document?: string;
  };
  seller: {
    name: string;
    email: string;
  };
}

interface FinancialEntry {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface Person {
  id: string;
  name: string;
  tradeName?: string;
  personType: 'PF' | 'PJ';
  roles: string;
  document?: string;
  phone: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
  sales?: { id: string; salePrice: number; motorcycle: { brand: string; model: string; plate: string } }[];
  leads?: { id: string; stage: string; source: string }[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'FINANCEIRO' | 'ESTOQUE';
  branchName?: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    'inicio' | 'dashboard' | 'estoque' | 'vendas' | 'ficha' | 'crm' | 'financeiro' | 'pessoas' | 'equipe' | 'documentos' | 'auditoria' | 'ia' | 'portais' | 'fiscal' | 'servicos' | 'importacao' | 'operacao'
  >('inicio');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [canViewCosts, setCanViewCosts] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Controle de Menus com Abas e Sub-abas expansíveis (Padrão Altimus / Autos 360)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    favoritos: true,
    geral: true,
    comercial: true,
    crm: true,
    financeiro: false,
    fiscal: false,
    integrador: false,
    servicos: false,
    ia: false,
    governanca: false,
  });

  const toggleMenu = (key: string) => {
    setExpandedMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'inicio':
        return [{ label: 'Início', active: true }];
      case 'dashboard':
        return [{ label: 'Dashboard', active: true }];
      case 'estoque':
        return [{ label: 'Geral' }, { label: 'Veículos' }, { label: 'Estoque de Veículos', active: true }];
      case 'ficha':
        return [
          { label: 'Geral' },
          { label: 'Veículos' },
          { label: selectedMoto ? `${selectedMoto.brand} ${selectedMoto.model} (${selectedMoto.plate})` : 'Ficha do Veículo', active: true }
        ];
      case 'pessoas':
        return [{ label: 'Geral' }, { label: 'Cadastros' }, { label: 'Clientes & Fornecedores', active: true }];
      case 'importacao':
        return [{ label: 'Geral' }, { label: 'Cadastros' }, { label: 'Importação de Dados', active: true }];
      case 'vendas':
        return [{ label: 'Comercial' }, { label: 'Negociações' }, { label: 'Negociações & Vendas', active: true }];
      case 'documentos':
        return [{ label: 'Comercial' }, { label: 'Negociações' }, { label: 'Documentos & Contratos', active: true }];
      case 'crm':
        return [{ label: 'CRM' }, { label: 'Oportunidades' }, { label: 'Kanban de Leads', active: true }];
      case 'financeiro':
        return [{ label: 'Financeiro' }, { label: 'Contas a Pagar / Receber' }, { label: 'Títulos & DRE', active: true }];
      case 'fiscal':
        return [{ label: 'Fiscal & RENAVE' }, { label: 'Documentos Fiscais' }, { label: 'NF-e, Pix & SERPRO', active: true }];
      case 'portais':
        return [{ label: 'Integrador' }, { label: 'Anúncios nos Portais' }, { label: 'Webmotors, OLX & ICarros', active: true }];
      case 'servicos':
        return [{ label: 'Avaliação & Serviços' }, { label: 'Ordens de Serviço' }, { label: 'Garantia 90D CDC', active: true }];
      case 'ia':
        return [{ label: 'Inteligência & IA' }, { label: 'Assistente Operacional' }, { label: 'Automações & Alertas', active: true }];
      case 'equipe':
        return [{ label: 'Governança & Sistema' }, { label: 'Usuários' }, { label: 'Permissões & RBAC', active: true }];
      case 'auditoria':
        return [{ label: 'Governança & Sistema' }, { label: 'Auditoria' }, { label: 'Logs de Ações', active: true }];
      case 'operacao':
        return [{ label: 'Governança & Sistema' }, { label: 'Saúde' }, { label: 'Diagnóstico & Métricas', active: true }];
      default:
        return [{ label: 'Início', active: true }];
    }
  };

  const [motos, setMotos] = useState<Motorcycle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [finance, setFinance] = useState<FinancialEntry[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedMoto, setSelectedMoto] = useState<Motorcycle | null>(null);
  const [selectedContractSale, setSelectedContractSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  // Sub-abas Horizontais da Ficha da Moto (Identico a tela do Altimus: Principal, Compra, Valores, FIPE, Opcionais, Pendencias, etc)
  const [fichaSubTab, setFichaSubTab] = useState<
    'principal' | 'compra' | 'valores' | 'fipe' | 'opcionais' | 'pendencias' | 'receitas_despesas' | 'fotos' | 'historico'
  >('principal');

  // FIPE API State (PRD 03)
  const [fipeBrands, setFipeBrands] = useState<{ codigo: string; nome: string }[]>([]);
  const [fipeModels, setFipeModels] = useState<{ codigo: string; nome: string }[]>([]);
  const [fipeYears, setFipeYears] = useState<{ codigo: string; nome: string }[]>([]);
  const [selectedFipeBrand, setSelectedFipeBrand] = useState('');
  const [selectedFipeModel, setSelectedFipeModel] = useState('');
  const [selectedFipeYear, setSelectedFipeYear] = useState('');
  const [fipeLoading, setFipeLoading] = useState(false);
  const [showModalFipeQuery, setShowModalFipeQuery] = useState(false);
  const [fipeResult, setFipeResult] = useState<any>(null);
  const [fipeTargetMoto, setFipeTargetMoto] = useState<Motorcycle | null>(null);

  // Filtros de Estoque
  const [searchEstoque, setSearchEstoque] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState('ALL');
  const [giroFilter, setGiroFilter] = useState('ALL');

  // Filtros de Pessoas (PRD 02)
  const [searchPeople, setSearchPeople] = useState('');
  const [peopleRoleFilter, setPeopleRoleFilter] = useState('ALL');

  // Modal Novo Cadastro de Moto (PRD 03)
  const [showModalMoto, setShowModalMoto] = useState(false);
  const [newBrand, setNewBrand] = useState('Honda');
  const [newModel, setNewModel] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newYearMfg, setNewYearMfg] = useState(2023);
  const [newYearModel, setNewYearModel] = useState(2023);
  const [newColor, setNewColor] = useState('Preta');
  const [newMileage, setNewMileage] = useState(15000);
  const [newDisplacement, setNewDisplacement] = useState(300);
  const [newFuel, setNewFuel] = useState('Gasolina');
  const [newOwnership, setNewOwnership] = useState('PROPRIA');
  const [newCondition, setNewCondition] = useState('SEMINOVA');
  const [newPublicPrice, setNewPublicPrice] = useState(35000);
  const [newFipeValue, setNewFipeValue] = useState(36500);
  const [newFipeCode, setNewFipeCode] = useState('');
  const [newLocation, setNewLocation] = useState('Showroom');
  const [newAcqCost, setNewAcqCost] = useState(28000);
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newFeatures, setNewFeatures] = useState<string[]>(['Freios ABS', 'Partida Elétrica']);
  const [savingMoto, setSavingMoto] = useState(false);

  // Modal Adicionar Custo (PRD 04)
  const [showModalCost, setShowModalCost] = useState(false);
  const [costCategory, setCostCategory] = useState('OFICINA_MECANICA');
  const [costDescription, setCostDescription] = useState('');
  const [costAmount, setCostAmount] = useState(0);
  const [costIsCredit, setCostIsCredit] = useState(false);
  const [costSupplierId, setCostSupplierId] = useState('');
  const [costStatus, setCostStatus] = useState('PAGO');
  const [savingCost, setSavingCost] = useState(false);

  // Modal Adicionar Pendência / OS (PRD 04)
  const [showModalTask, setShowModalTask] = useState(false);
  const [taskType, setTaskType] = useState('REVISAO_MECANICA');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIA');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskPartnerId, setTaskPartnerId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskCostEst, setTaskCostEst] = useState(0);
  const [savingTask, setSavingTask] = useState(false);

  // Modal Alterar Situação da Moto (PRD 03)
  const [showModalStatusChange, setShowModalStatusChange] = useState(false);
  const [targetStatus, setTargetStatus] = useState('EM_PREPARACAO');
  const [statusReason, setStatusReason] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Modal de Concretizar Venda
  const [showModalSale, setShowModalSale] = useState(false);
  const [saleMotoId, setSaleMotoId] = useState('');
  const [saleCustName, setSaleCustName] = useState('');
  const [saleCustPhone, setSaleCustPhone] = useState('');
  const [saleCustDoc, setSaleCustDoc] = useState('');
  const [salePrice, setSalePrice] = useState(0);
  const [salePaymentType, setSalePaymentType] = useState('A_VISTA');
  const [saleTradeAmount, setSaleTradeAmount] = useState(0);
  const [saleTradePlate, setSaleTradePlate] = useState('');
  const [saleTradeBrand, setSaleTradeBrand] = useState('Yamaha');
  const [saleTradeModel, setSaleTradeModel] = useState('');
  const [submittingSale, setSubmittingSale] = useState(false);

  // Modal Nova Pessoa (PRD 02)
  const [showModalPerson, setShowModalPerson] = useState(false);
  const [pName, setPName] = useState('');
  const [pTradeName, setPTradeName] = useState('');
  const [pType, setPType] = useState<'PF' | 'PJ'>('PF');
  const [pRoles, setPRoles] = useState('CLIENTE');
  const [pDoc, setPDoc] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pCity, setPCity] = useState('Florianópolis');
  const [pState, setPState] = useState('SC');
  const [pAddress, setPAddress] = useState('');
  const [pNotes, setPNotes] = useState('');
  const [savingPerson, setSavingPerson] = useState(false);

  // Modal Novo Usuário (PRD 01)
  const [showModalUser, setShowModalUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'FINANCEIRO' | 'ESTOQUE'>('VENDEDOR');

  // Estados Financeiro & DRE (PRD 07)
  const [financeSubTab, setFinanceSubTab] = useState<'titulos' | 'dre' | 'contas'>('titulos');
  const [financialAccounts, setFinancialAccounts] = useState<any[]>([]);
  const [financialEntries, setFinancialEntries] = useState<any[]>([]);
  const [financialDre, setFinancialDre] = useState<any>(null);
  const [financialKpis, setFinancialKpis] = useState<any>(null);
  const [financeTypeFilter, setFinanceTypeFilter] = useState('ALL');
  const [financeStatusFilter, setFinanceStatusFilter] = useState('ALL');
  const [financeRegime, setFinanceRegime] = useState<'CAIXA' | 'COMPETENCIA'>('CAIXA');

  // Modal Novo Título / Despesa
  const [showModalFinanceEntry, setShowModalFinanceEntry] = useState(false);
  const [fEntryType, setFEntryType] = useState<'DESPESA' | 'RECEITA'>('DESPESA');
  const [fEntryCategory, setFEntryCategory] = useState('ALUGUEL');
  const [fEntryCostCenter, setFEntryCostCenter] = useState('SHOWROOM');
  const [fEntryDesc, setFEntryDesc] = useState('');
  const [fEntryAmount, setFEntryAmount] = useState(0);
  const [fEntryDueDate, setFEntryDueDate] = useState('');
  const [fEntryMethod, setFEntryMethod] = useState('PIX');
  const [fEntryAccountId, setFEntryAccountId] = useState('');
  const [fEntryCustomerId, setFEntryCustomerId] = useState('');
  const [fEntryMotoId, setFEntryMotoId] = useState('');
  const [savingFEntry, setSavingFEntry] = useState(false);

  // Modal Baixa de Título
  const [showModalBaixa, setShowModalBaixa] = useState(false);
  const [baixaEntry, setBaixaEntry] = useState<any>(null);
  const [baixaAccountId, setBaixaAccountId] = useState('');
  const [baixaPaidAmount, setBaixaPaidAmount] = useState(0);
  const [baixaDate, setBaixaDate] = useState('');
  const [savingBaixa, setSavingBaixa] = useState(false);

  // Estados CRM Avançado & Atendimento (PRD 08)
  const [crmViewMode, setCrmViewMode] = useState<'kanban' | 'lista'>('kanban');
  const [crmMetrics, setCrmMetrics] = useState<any>(null);
  const [selectedCrmLead, setSelectedCrmLead] = useState<Lead | null>(null);
  const [showModalCrmDetail, setShowModalCrmDetail] = useState(false);
  const [showModalNewLead, setShowModalNewLead] = useState(false);
  const [showModalLoss, setShowModalLoss] = useState(false);
  const [lossTargetLeadId, setLossTargetLeadId] = useState('');
  const [lossReasonInput, setLossReasonInput] = useState('Preço / Condição alta');
  const [newInteractionType, setNewInteractionType] = useState('WHATSAPP');
  const [newInteractionDesc, setNewInteractionDesc] = useState('');
  const [savingInteraction, setSavingInteraction] = useState(false);

  // Form Novo Lead Manual
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadMotoId, setNewLeadMotoId] = useState('');
  const [newLeadSource, setNewLeadSource] = useState('BALCAO_PRESENCIAL');
  const [newLeadBudget, setNewLeadBudget] = useState(0);
  const [newLeadNextAction, setNewLeadNextAction] = useState('Primeiro contato telefônico');
  const [newLeadSellerId, setNewLeadSellerId] = useState('');
  const [savingNewLead, setSavingNewLead] = useState(false);

  // Estados de Documentos & Contratos (PRD 09)
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showModalPrintDoc, setShowModalPrintDoc] = useState(false);
  const [showModalGenerateDoc, setShowModalGenerateDoc] = useState(false);
  const [docFilterType, setDocFilterType] = useState('ALL');
  const [docSearch, setDocSearch] = useState('');

  // Form de Geração de Documento (PRD 09)
  const [genDocType, setGenDocType] = useState('CONTRATO_VENDA');
  const [genDocSaleId, setGenDocSaleId] = useState('');
  const [genDocMotoId, setGenDocMotoId] = useState('');
  const [genDocBuyerName, setGenDocBuyerName] = useState('');
  const [genDocBuyerDoc, setGenDocBuyerDoc] = useState('');
  const [genDocBuyerRg, setGenDocBuyerRg] = useState('');
  const [genDocBuyerPhone, setGenDocBuyerPhone] = useState('');
  const [genDocBuyerAddress, setGenDocBuyerAddress] = useState('');
  const [genDocSalePrice, setGenDocSalePrice] = useState(0);
  const [genDocEntryAmount, setGenDocEntryAmount] = useState(0);
  const [genDocDepositAmount, setGenDocDepositAmount] = useState(1000);
  const [genDocReservationDays, setGenDocReservationDays] = useState(5);
  const [savingDoc, setSavingDoc] = useState(false);

  // Estados de Auditoria & Segurança (PRD 10)
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditMetrics, setAuditMetrics] = useState<any>(null);
  const [auditFilterAction, setAuditFilterAction] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Estados de IA & Automações (PRD 10)
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showModalAiListing, setShowModalAiListing] = useState(false);
  const [generatedListing, setGeneratedListing] = useState<any>(null);
  const [leadAiSummary, setLeadAiSummary] = useState<any>(null);
  const [aiChatMessages, setAiChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o Assistente Inteligente da The Rock Moto Shop (PRD 10). Posso analisar o estoque, verificar giro de pátio, pendências e auxiliar na redação de anúncios e resumos de atendimento.',
    },
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadFinancialData = async (regime = financeRegime) => {
    try {
      const res = await fetch(`/api/financial?regime=${regime}`);
      if (res.ok) {
        const data = await res.json();
        setFinancialAccounts(data.accounts || []);
        setFinancialEntries(data.entries || []);
        setFinancialDre(data.dre || null);
        setFinancialKpis(data.kpis || null);
      }
    } catch (e) {
      console.error('Erro ao carregar dados financeiros:', e);
    }
  };

  const loadData = async () => {
    try {
      const [resAuth, resMotos, resLeads, resSales, resDash, resUsers, resPeople, resFinance, resDocs] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/motorcycles'),
        fetch('/api/leads'),
        fetch('/api/sales'),
        fetch('/api/dashboard'),
        fetch('/api/users'),
        fetch('/api/people'),
        fetch(`/api/financial?regime=${financeRegime}`),
        fetch('/api/documents'),
      ]);

      if (resAuth.ok) {
        const authData = await resAuth.json();
        setCurrentUser(authData.user);
        setCanViewCosts(authData.permissions.canViewCosts);
      }

      const dataMotos = await resMotos.json();
      const dataLeads = await resLeads.json();
      const dataSales = await resSales.json();
      const dataDash = await resDash.json();
      const dataUsers = await resUsers.json();
      const dataPeople = await resPeople.json();
      const dataFinance = await resFinance.json();
      const dataDocs = await resDocs.json();

      setDashboardData(dataDash);
      if (dataFinance.accounts) setFinancialAccounts(dataFinance.accounts);
      if (dataFinance.entries) setFinancialEntries(dataFinance.entries);
      if (dataFinance.dre) setFinancialDre(dataFinance.dre);
      if (dataFinance.kpis) setFinancialKpis(dataFinance.kpis);
      if (Array.isArray(dataDocs?.documents)) setDocuments(dataDocs.documents);
      if (Array.isArray(dataMotos)) {
        setMotos(dataMotos);
        if (dataMotos.length > 0) {
          // Atualiza a moto selecionada mantendo se já houver uma
          setSelectedMoto(prev => {
            if (!prev) return dataMotos[0];
            const updated = dataMotos.find(m => m.id === prev.id);
            return updated || dataMotos[0];
          });
        }
      }
      if (dataLeads && dataLeads.leads) {
        setLeads(dataLeads.leads);
        setCrmMetrics(dataLeads.metrics);
        if (selectedCrmLead) {
          const updatedSelected = dataLeads.leads.find((l: any) => l.id === selectedCrmLead.id);
          if (updatedSelected) setSelectedCrmLead(updatedSelected);
        }
      } else if (Array.isArray(dataLeads)) {
        setLeads(dataLeads);
      }
      if (Array.isArray(dataSales)) setSales(dataSales);
      if (dataDash.financeiro) setFinance(dataDash.financeiro);
      if (Array.isArray(dataUsers)) setTeam(dataUsers);
      if (Array.isArray(dataPeople)) setPeople(dataPeople);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadAuditLogs();
    loadSystemAlerts();
  }, []);

  useEffect(() => {
    if (activeTab === 'auditoria') {
      loadAuditLogs();
    }
    if (activeTab === 'ia') {
      loadSystemAlerts();
    }
  }, [activeTab]);

  // Helpers de Documentos & Contratos (PRD 09)
  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAuditLogs = async (action = auditFilterAction, search = auditSearch) => {
    setLoadingAudit(true);
    try {
      const query = new URLSearchParams();
      if (action && action !== 'ALL') query.set('action', action);
      if (search) query.set('search', search);
      const res = await fetch(`/api/audit?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
        setAuditMetrics(data.metrics || null);
      }
    } catch (e) {
      console.error('Erro ao carregar auditoria:', e);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Funções de IA & Automações (PRD 10)
  const loadSystemAlerts = async () => {
    try {
      const res = await fetch('/api/ai?action=alerts');
      if (res.ok) {
        const data = await res.json();
        setSystemAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAutomations = async () => {
    try {
      const res = await fetch('/api/ai?action=run_automations');
      if (res.ok) {
        const data = await res.json();
        setSystemAlerts(data.alerts || []);
        showToast(`Varredura concluída! ${data.alertsCreated} novo(s) alerta(s) identificados.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/ai', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      if (res.ok) {
        setSystemAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateListingAi = async (moto: Motorcycle) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_listing', motorcycleId: moto.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedListing(data.listing);
        setShowModalAiListing(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarizeLeadAi = async (lead: Lead) => {
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summarize_lead', leadId: lead.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeadAiSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendAiChatMessage = async (msgText?: string) => {
    const textToSend = msgText || aiInputText;
    if (!textToSend.trim()) return;

    const newHistory = [...aiChatMessages, { role: 'user' as const, content: textToSend }];
    setAiChatMessages(newHistory);
    setAiInputText('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          question: textToSend,
          userRole: currentUser?.role || 'VENDEDOR',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiChatMessages([...newHistory, { role: 'assistant' as const, content: data.answer }]);
      }
    } catch (e) {
      setAiChatMessages([
        ...newHistory,
        { role: 'assistant' as const, content: 'Erro temporário ao consultar o motor de IA.' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenPrintDoc = (doc: any) => {
    setSelectedDoc(doc);
    setShowModalPrintDoc(true);
  };

  const handlePrintCurrentDoc = () => {
    window.print();
  };

  const handleMarkDocSigned = async (docId: string) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId, status: 'ASSINADO' }),
      });
      if (res.ok) {
        showToast('Documento registrado como ASSINADO!');
        loadDocuments();
        if (selectedDoc?.id === docId) {
          setSelectedDoc((prev: any) => ({ ...prev, status: 'ASSINADO' }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Deseja excluir este documento?')) return;
    try {
      const res = await fetch(`/api/documents?id=${docId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Documento excluído.');
        loadDocuments();
        if (selectedDoc?.id === docId) setShowModalPrintDoc(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenSaleContracts = (sale: Sale) => {
    const foundDoc = documents.find((d) => d.saleId === sale.id && d.type === 'CONTRATO_VENDA');
    if (foundDoc) {
      handleOpenPrintDoc(foundDoc);
    } else {
      setGenDocType('CONTRATO_VENDA');
      setGenDocSaleId(sale.id);
      setGenDocMotoId(sale.motorcycle.id);
      setGenDocBuyerName(sale.customer.name);
      setGenDocBuyerDoc(sale.customer.document || '');
      setGenDocBuyerPhone(sale.customer.phone);
      setGenDocSalePrice(sale.salePrice);
      setGenDocEntryAmount(sale.entryAmount || 0);
      setShowModalGenerateDoc(true);
    }
  };

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genDocMotoId && !genDocSaleId) {
      alert('Selecione uma moto ou venda para emissão');
      return;
    }
    setSavingDoc(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: genDocType,
          saleId: genDocSaleId || null,
          motorcycleId: genDocMotoId || null,
          buyerName: genDocBuyerName,
          buyerDoc: genDocBuyerDoc,
          buyerRg: genDocBuyerRg,
          buyerPhone: genDocBuyerPhone,
          buyerAddress: genDocBuyerAddress,
          salePrice: Number(genDocSalePrice),
          entryAmount: Number(genDocEntryAmount),
          depositAmount: Number(genDocDepositAmount),
          reservationDeadlineDays: Number(genDocReservationDays),
        }),
      });

      if (res.ok) {
        const doc = await res.json();
        showToast('Documento oficial gerado com sucesso!');
        setShowModalGenerateDoc(false);
        loadDocuments();
        setSelectedDoc(doc);
        setShowModalPrintDoc(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao gerar documento');
      }
    } catch (e) {
      alert('Erro de conexão ao gerar documento');
    } finally {
      setSavingDoc(false);
    }
  };

  // Helper para cálculo de dias em estoque
  const calcDaysInStock = (entryDate: string) => {
    const diff = Date.now() - new Date(entryDate).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  // Helper para cálculo do Custo Real Reconciliado (PRD 04)
  const calcRealCost = (moto: Motorcycle) => {
    if (!moto.costs || moto.costs.length === 0) return 0;
    return moto.costs.reduce((acc, c) => {
      if (c.status === 'CANCELADO') return acc;
      return c.isCredit ? acc - c.amount : acc + c.amount;
    }, 0);
  };

  // Funções FIPE API Oficial (PRD 03)
  const loadFipeBrands = async () => {
    if (fipeBrands.length > 0) return;
    try {
      setFipeLoading(true);
      const res = await fetch('/api/fipe?action=brands');
      if (res.ok) {
        const data = await res.json();
        setFipeBrands(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFipeLoading(false);
    }
  };

  const handleSelectFipeBrand = async (brandCode: string) => {
    setSelectedFipeBrand(brandCode);
    setSelectedFipeModel('');
    setSelectedFipeYear('');
    setFipeModels([]);
    setFipeYears([]);
    setFipeResult(null);

    const brandObj = fipeBrands.find(b => b.codigo === brandCode);
    if (brandObj) setNewBrand(brandObj.nome);

    if (!brandCode) return;
    try {
      setFipeLoading(true);
      const res = await fetch(`/api/fipe?action=models&brandId=${brandCode}`);
      if (res.ok) {
        const data = await res.json();
        setFipeModels(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFipeLoading(false);
    }
  };

  const handleSelectFipeModel = async (modelCode: string) => {
    setSelectedFipeModel(modelCode);
    setSelectedFipeYear('');
    setFipeYears([]);
    setFipeResult(null);

    const modelObj = fipeModels.find(m => m.codigo === modelCode);
    if (modelObj) {
      setNewModel(modelObj.nome);
    }

    if (!modelCode || !selectedFipeBrand) return;
    try {
      setFipeLoading(true);
      const res = await fetch(`/api/fipe?action=years&brandId=${selectedFipeBrand}&modelId=${modelCode}`);
      if (res.ok) {
        const data = await res.json();
        setFipeYears(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFipeLoading(false);
    }
  };

  const handleSelectFipeYear = async (yearCode: string) => {
    setSelectedFipeYear(yearCode);
    if (!yearCode || !selectedFipeBrand || !selectedFipeModel) return;

    try {
      setFipeLoading(true);
      const res = await fetch(
        `/api/fipe?action=price&brandId=${selectedFipeBrand}&modelId=${selectedFipeModel}&yearId=${yearCode}`
      );
      if (res.ok) {
        const data = await res.json();
        setFipeResult(data);

        if (data.numericValue) {
          setNewFipeValue(data.numericValue);
          setNewPublicPrice(Math.round(data.numericValue));
          setNewAcqCost(Math.round(data.numericValue * 0.82));
        }
        if (data.CodigoFipe) setNewFipeCode(data.CodigoFipe);
        if (data.AnoModelo) {
          setNewYearMfg(data.AnoModelo);
          setNewYearModel(data.AnoModelo);
        }
        if (data.Combustivel) setNewFuel(data.Combustivel);
        showToast(`Dados FIPE: ${data.Modelo} (${data.Valor})`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFipeLoading(false);
    }
  };

  const handleApplyFipeToCurrentMoto = async () => {
    if (!fipeTargetMoto || !fipeResult) return;
    try {
      const res = await fetch(`/api/motorcycles/${fipeTargetMoto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fipeValue: fipeResult.numericValue,
          fipeCode: fipeResult.CodigoFipe,
          fipeRefMonth: fipeResult.MesReferencia,
          statusReason: `Atualização oficial de cotação via Tabela FIPE (${fipeResult.Valor})`,
          userName: currentUser?.name || 'Administrador',
        }),
      });

      if (res.ok) {
        showToast(`Cotação FIPE da moto atualizada para R$ ${fipeResult.numericValue.toLocaleString('pt-BR')}!`);
        setShowModalFipeQuery(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Sessão alterada para ${data.user.name} (${data.user.role})`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cadastro de Nova Moto (PRD 03)
  const handleCreateMoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newModel) return;

    setSavingMoto(true);
    try {
      const res = await fetch('/api/motorcycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate: newPlate,
          brand: newBrand,
          model: newModel,
          version: newVersion,
          yearMfg: newYearMfg,
          yearModel: newYearModel,
          color: newColor,
          mileage: newMileage,
          displacement: newDisplacement,
          fuel: newFuel,
          ownership: newOwnership,
          condition: newCondition,
          publicPrice: newPublicPrice,
          fipeValue: newFipeValue,
          fipeCode: newFipeCode,
          location: newLocation,
          acquisitionCost: newAcqCost,
          supplierId: newSupplierId || null,
          features: newFeatures,
          status: 'DISPONIVEL',
        }),
      });

      if (res.ok) {
        showToast(`Moto ${newBrand} ${newModel} cadastrada com sucesso!`);
        setShowModalMoto(false);
        setNewModel('');
        setNewPlate('');
        setNewVersion('');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao cadastrar moto');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar moto');
    } finally {
      setSavingMoto(false);
    }
  };

  // Adicionar Custo (PRD 04)
  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMoto || !costDescription || !costAmount) return;

    setSavingCost(true);
    try {
      const res = await fetch(`/api/motorcycles/${selectedMoto.id}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: costCategory,
          description: costDescription,
          amount: costAmount,
          isCredit: costIsCredit,
          supplierId: costSupplierId || null,
          status: costStatus,
          createdByName: currentUser?.name || 'Administrador',
        }),
      });

      if (res.ok) {
        showToast('Custo/despesa lançado com sucesso!');
        setShowModalCost(false);
        setCostDescription('');
        setCostAmount(0);
        setCostIsCredit(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao lançar custo');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar custo');
    } finally {
      setSavingCost(false);
    }
  };

  // Deletar Custo (PRD 04)
  const handleDeleteCost = async (costId: string) => {
    if (!selectedMoto || !confirm('Deseja realmente remover este lançamento de custo?')) return;
    try {
      const res = await fetch(`/api/motorcycles/${selectedMoto.id}/costs?costId=${costId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Lançamento removido.');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Adicionar Pendência / OS (PRD 04)
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMoto || !taskTitle) return;

    setSavingTask(true);
    try {
      const res = await fetch(`/api/motorcycles/${selectedMoto.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: taskType,
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          assignedTo: taskAssignedTo,
          partnerId: taskPartnerId || null,
          dueDate: taskDueDate || null,
          costEstimate: taskCostEst,
        }),
      });

      if (res.ok) {
        showToast('Pendência / OS adicionada!');
        setShowModalTask(false);
        setTaskTitle('');
        setTaskDesc('');
        setTaskCostEst(0);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao salvar pendência');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao criar pendência');
    } finally {
      setSavingTask(false);
    }
  };

  // Atualizar Status da Pendência (1-click toggle)
  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    if (!selectedMoto) return;
    const nextStatus = currentStatus === 'ABERTA' ? 'EM_ANDAMENTO' : currentStatus === 'EM_ANDAMENTO' ? 'CONCLUIDA' : 'ABERTA';

    try {
      const res = await fetch(`/api/motorcycles/${selectedMoto.id}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        showToast(`Status da tarefa alterado para ${nextStatus}`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Alterar Situação da Moto com Histórico Imutável (PRD 03)
  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMoto) return;

    setSavingStatus(true);
    try {
      const res = await fetch(`/api/motorcycles/${selectedMoto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          statusReason: statusReason || 'Atualização manual no painel de controle.',
          userName: currentUser?.name || 'Administrador',
        }),
      });

      if (res.ok) {
        showToast(`Situação alterada para ${targetStatus}`);
        setShowModalStatusChange(false);
        setStatusReason('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStatus(false);
    }
  };

  // Vendas
  const handleOpenSaleModal = (moto: Motorcycle) => {
    setSaleMotoId(moto.id);
    setSalePrice(moto.publicPrice);
    setSaleTradeAmount(0);
    setSalePaymentType('A_VISTA');
    setShowModalSale(true);
  };

  const handleExecuteSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleMotoId || !saleCustName || !saleCustPhone) return;

    setSubmittingSale(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motorcycleId: saleMotoId,
          customerName: saleCustName,
          customerPhone: saleCustPhone,
          customerDocument: saleCustDoc,
          salePrice: Number(salePrice),
          paymentType: salePaymentType,
          tradeInAmount: salePaymentType === 'TROCA' ? Number(saleTradeAmount) : 0,
          tradeInPlate: salePaymentType === 'TROCA' ? saleTradePlate : undefined,
          tradeInBrand: salePaymentType === 'TROCA' ? saleTradeBrand : undefined,
          tradeInModel: salePaymentType === 'TROCA' ? saleTradeModel : undefined,
          tradeInYear: 2021,
          sellerEmail: currentUser?.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Venda concluída! Margem realizada: R$ ${data.grossProfit.toLocaleString('pt-BR')}`);
        setShowModalSale(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao processar venda');
      }
    } catch {
      alert('Erro de conexão ao processar venda');
    } finally {
      setSubmittingSale(false);
    }
  };

  // Pessoas
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPhone) return;

    setSavingPerson(true);
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pName,
          tradeName: pTradeName,
          personType: pType,
          roles: pRoles,
          document: pDoc,
          phone: pPhone,
          email: pEmail,
          city: pCity,
          state: pState,
          address: pAddress,
          notes: pNotes,
        }),
      });

      if (res.ok) {
        showToast(`Cadastro de ${pName} realizado com sucesso!`);
        setShowModalPerson(false);
        setPName('');
        setPTradeName('');
        setPDoc('');
        setPPhone('');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao cadastrar pessoa');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSavingPerson(false);
    }
  };

  // Usuários
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
        }),
      });

      if (res.ok) {
        showToast(`Novo usuário ${newUserName} criado com sucesso!`);
        setShowModalUser(false);
        setNewUserName('');
        setNewUserEmail('');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao criar usuário');
      }
    } catch {
      alert('Erro de conexão');
    }
  };

  // Funções Financeiras & DRE (PRD 07)
  const handleCreateFinancialEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fEntryDesc || !fEntryAmount || !fEntryDueDate) return;

    setSavingFEntry(true);
    try {
      const res = await fetch('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: fEntryType,
          category: fEntryCategory,
          costCenter: fEntryCostCenter,
          description: fEntryDesc,
          amount: Number(fEntryAmount),
          dueDate: fEntryDueDate,
          paymentMethod: fEntryMethod,
          financialAccountId: fEntryAccountId || null,
          customerId: fEntryCustomerId || null,
          motorcycleId: fEntryMotoId || null,
        }),
      });

      if (res.ok) {
        showToast('Lançamento financeiro cadastrado com sucesso!');
        setShowModalFinanceEntry(false);
        setFEntryDesc('');
        setFEntryAmount(0);
        setFEntryDueDate('');
        loadFinancialData();
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao cadastrar título');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSavingFEntry(false);
    }
  };

  const handleOpenBaixa = (entry: any) => {
    setBaixaEntry(entry);
    setBaixaPaidAmount(entry.amount);
    setBaixaAccountId(entry.financialAccountId || (financialAccounts[0]?.id || ''));
    setBaixaDate(new Date().toISOString().split('T')[0]);
    setShowModalBaixa(true);
  };

  const handleExecuteBaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baixaEntry) return;

    setSavingBaixa(true);
    try {
      const res = await fetch('/api/financial', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: baixaEntry.id,
          action: 'BAIXA',
          paidAmount: Number(baixaPaidAmount),
          paymentDate: baixaDate,
          financialAccountId: baixaAccountId,
        }),
      });

      if (res.ok) {
        showToast(`Baixa realizada! Título liquidado com sucesso.`);
        setShowModalBaixa(false);
        setBaixaEntry(null);
        loadFinancialData();
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao processar baixa');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSavingBaixa(false);
    }
  };

  const handleCancelarTitulo = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este título financeiro?')) return;
    try {
      const res = await fetch('/api/financial', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: id,
          action: 'CANCELAR',
        }),
      });
      if (res.ok) {
        showToast('Título financeiro cancelado.');
        loadFinancialData();
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTitulo = async (id: string) => {
    if (!confirm('Deseja excluir definitivamente este título financeiro?')) return;
    try {
      const res = await fetch(`/api/financial?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Título excluído.');
        loadFinancialData();
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRM Helper Templates de WhatsApp (PRD 08)
  const getWhatsAppTemplate = (lead: Lead, templateType: 'primeiro_contato' | 'test_ride' | 'financiamento') => {
    const motoName = lead.motorcycle ? `${lead.motorcycle.brand} ${lead.motorcycle.model}` : 'sua moto dos sonhos';
    const firstName = lead.name.split(' ')[0];
    if (templateType === 'primeiro_contato') {
      return `Olá ${firstName}! Tudo bem? Aqui é da The Rock Moto Shop. Vi que você demonstrou interesse na ${motoName} em nosso site. Posso te passar mais detalhes e fotos exclusivas dela?`;
    }
    if (templateType === 'test_ride') {
      return `Fala ${firstName}! A ${motoName} está impecável aqui no nosso showroom em Florianópolis. Gostaria de passar aqui hoje para tomar um café e fazer um test-ride sem compromisso?`;
    }
    return `Olá ${firstName}! Preparei uma simulação especial de financiamento para a ${motoName}. Com uma pequena entrada conseguimos parcelas que cabem no seu bolso. Gostaria de conferir?`;
  };

  const buildWhatsAppUrl = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    return `https://wa.me/55${cleanPhone}?text=${encoded}`;
  };

  const handleOpenLeadDetails = (lead: Lead) => {
    setSelectedCrmLead(lead);
    setShowModalCrmDetail(true);
  };

  const handleCreateNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) return;

    setSavingNewLead(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeadName,
          phone: newLeadPhone,
          email: newLeadEmail || null,
          motorcycleId: newLeadMotoId || null,
          source: newLeadSource,
          budget: Number(newLeadBudget) || null,
          assignedToId: newLeadSellerId || currentUser?.id,
          nextAction: newLeadNextAction,
        }),
      });

      if (res.ok) {
        showToast(`Lead ${newLeadName} cadastrado no CRM!`);
        setShowModalNewLead(false);
        setNewLeadName('');
        setNewLeadPhone('');
        setNewLeadEmail('');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao criar lead');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSavingNewLead(false);
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrmLead || !newInteractionDesc) return;

    setSavingInteraction(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedCrmLead.id,
          interactionType: newInteractionType,
          interactionDesc: newInteractionDesc,
          authorName: currentUser?.name || 'Vendedor',
        }),
      });

      if (res.ok) {
        showToast('Interação registrada no histórico!');
        setNewInteractionDesc('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingInteraction(false);
    }
  };

  const handleConfirmLoss = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lossTargetLeadId) return;

    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lossTargetLeadId,
          stage: 'PERDIDO',
          lossReason: lossReasonInput,
          authorName: currentUser?.name || 'Vendedor',
        }),
      });

      if (res.ok) {
        showToast('Lead marcado como PERDIDO com motivo registrado.');
        setShowModalLoss(false);
        setLossTargetLeadId('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertLeadToSale = (lead: Lead) => {
    if (lead.motorcycle) {
      const foundMoto = motos.find((m) => m.id === lead.motorcycle?.id);
      if (foundMoto) {
        setSaleMotoId(foundMoto.id);
        setSalePrice(foundMoto.publicPrice);
      }
    }
    setSaleCustName(lead.name);
    setSaleCustPhone(lead.phone);
    setSaleCustDoc('');
    setShowModalSale(true);
  };

  // Avançar estágio do Lead
  const handleUpdateLeadStage = async (leadId: string, nextStage: string) => {
    if (nextStage === 'PERDIDO') {
      setLossTargetLeadId(leadId);
      setShowModalLoss(true);
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, stage: nextStage }),
      });
      if (res.ok) {
        showToast(`Lead avançado para ${nextStage}`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtros de Estoque
  const filteredMotos = motos.filter((m) => {
    const term = searchEstoque.toLowerCase();
    const matchesSearch =
      m.model.toLowerCase().includes(term) ||
      m.brand.toLowerCase().includes(term) ||
      m.plate.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesOwnership = ownershipFilter === 'ALL' || m.ownership === ownershipFilter;

    let matchesGiro = true;
    const days = calcDaysInStock(m.entryDate);
    if (giroFilter === 'CRITICO') matchesGiro = days > 45;
    if (giroFilter === 'ATENCAO') matchesGiro = days >= 30 && days <= 45;
    if (giroFilter === 'RAPIDO') matchesGiro = days < 30;

    return matchesSearch && matchesStatus && matchesOwnership && matchesGiro;
  });

  // Filtros de Pessoas
  const filteredPeople = people.filter((p) => {
    const term = searchPeople.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      (p.tradeName && p.tradeName.toLowerCase().includes(term)) ||
      (p.document && p.document.toLowerCase().includes(term)) ||
      p.phone.includes(term);

    const matchesRole =
      peopleRoleFilter === 'ALL' ||
      (p.roles && p.roles.includes(peopleRoleFilter));

    return matchesSearch && matchesRole;
  });

  const totalMotosEmEstoque = motos.filter((m) => m.status !== 'VENDIDA' && m.status !== 'ARQUIVADA').length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-18' : 'w-64'
        } bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-900 select-none transition-all duration-200`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6d3df5] to-[#9165ff] flex items-center justify-center text-white shadow-md shadow-purple-600/30 shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <span className="font-black text-white text-base tracking-tight block">MotoFlow</span>
                <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest block">
                  Altimus ERP Motos
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="px-3 py-3 border-b border-slate-800/50 bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                {!sidebarCollapsed && (
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">{currentUser.role}</span>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <Link
                  href="/login"
                  className="text-slate-500 hover:text-white p-1 rounded transition"
                  title="Sair / Trocar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Navigation com Abas Principais e Sub-Abas (Padrão Altimus) */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {/* Aba 1: Início */}
          <button
            onClick={() => setActiveTab('inicio')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'inicio'
                ? 'bg-[#6d3df5] text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Início"
          >
            <Home className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Início</span>}
          </button>

          {/* Aba 2: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'dashboard'
                ? 'bg-[#6d3df5] text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>

          {/* Favoritos (Acordeão como no Altimus) */}
          <div className="pt-1">
            <button
              onClick={() => toggleMenu('favoritos')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <span className="flex items-center gap-2.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {!sidebarCollapsed && <span>Favoritos</span>}
              </span>
              {!sidebarCollapsed && (
                expandedMenus.favoritos ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {(!sidebarCollapsed && expandedMenus.favoritos) && (
              <div className="pl-6 pr-1 pt-1 space-y-0.5">
                <button
                  onClick={() => setActiveTab('estoque')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'estoque' ? 'text-white font-bold bg-white/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  • Veículos em Estoque
                </button>
                <button
                  onClick={() => setActiveTab('vendas')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'vendas' ? 'text-white font-bold bg-white/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  • Negociações & Vendas
                </button>
                {canViewCosts && (
                  <button
                    onClick={() => setActiveTab('financeiro')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                      activeTab === 'financeiro' ? 'text-white font-bold bg-white/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Contas a Pagar/Receber
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('portais')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'portais' ? 'text-white font-bold bg-white/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  • Anúncios nos Portais
                </button>
              </div>
            )}
          </div>

          {/* Seção Geral */}
          <div className="pt-1">
            <button
              onClick={() => toggleMenu('geral')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <span className="flex items-center gap-2.5">
                <Folder className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                {!sidebarCollapsed && <span>Geral</span>}
              </span>
              {!sidebarCollapsed && (
                expandedMenus.geral ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {(!sidebarCollapsed && expandedMenus.geral) && (
              <div className="pl-3 pr-1 pt-1 space-y-0.5">
                <button
                  onClick={() => setActiveTab('estoque')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'estoque' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bike className="w-3.5 h-3.5" /> Estoque de Veículos
                  </span>
                  <span className="text-[10px] bg-white/15 px-1.5 py-0.2 rounded font-mono">
                    {totalMotosEmEstoque}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('ficha')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'ficha' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Ficha do Veículo
                  </span>
                  {selectedMoto && (
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono px-1 py-0.2 rounded">
                      {selectedMoto.plate}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('pessoas')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'pessoas' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Contact className="w-3.5 h-3.5" /> Clientes & Fornecedores
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                    {people.length}
                  </span>
                </button>

                {(currentUser?.role === 'ADMIN' || currentUser?.role === 'GERENTE') && (
                  <button
                    onClick={() => setActiveTab('importacao')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
                      activeTab === 'importacao' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" /> Importação de Dados
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Seção Comercial */}
          <div className="pt-1">
            <button
              onClick={() => toggleMenu('comercial')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <span className="flex items-center gap-2.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {!sidebarCollapsed && <span>Comercial</span>}
              </span>
              {!sidebarCollapsed && (
                expandedMenus.comercial ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {(!sidebarCollapsed && expandedMenus.comercial) && (
              <div className="pl-3 pr-1 pt-1 space-y-0.5">
                <button
                  onClick={() => setActiveTab('vendas')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'vendas' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HandCoins className="w-3.5 h-3.5" /> Negociações & Vendas
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    {sales.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('documentos')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'documentos' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Printer className="w-3.5 h-3.5" /> Documentos & Contratos
                  </span>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                    {documents.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Seção CRM */}
          <div className="pt-1">
            <button
              onClick={() => toggleMenu('crm')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                {!sidebarCollapsed && <span>CRM</span>}
              </span>
              {!sidebarCollapsed && (
                expandedMenus.crm ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {(!sidebarCollapsed && expandedMenus.crm) && (
              <div className="pl-3 pr-1 pt-1 space-y-0.5">
                <button
                  onClick={() => setActiveTab('crm')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'crm' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Oportunidades (Kanban)
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                    {leads.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Seção Financeiro */}
          {canViewCosts && (
            <div className="pt-1">
              <button
                onClick={() => toggleMenu('financeiro')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
              >
                <span className="flex items-center gap-2.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {!sidebarCollapsed && <span>Financeiro</span>}
                </span>
                {!sidebarCollapsed && (
                  expandedMenus.financeiro ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {(!sidebarCollapsed && expandedMenus.financeiro) && (
                <div className="pl-3 pr-1 pt-1 space-y-0.5">
                  <button
                    onClick={() => setActiveTab('financeiro')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
                      activeTab === 'financeiro' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Contas a Pagar/Receber & DRE
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Seção Fiscal & RENAVE */}
          {canViewCosts && (
            <div className="pt-1">
              <button
                onClick={() => toggleMenu('fiscal')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
              >
                <span className="flex items-center gap-2.5">
                  <Receipt className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  {!sidebarCollapsed && <span>Fiscal & RENAVE</span>}
                </span>
                {!sidebarCollapsed && (
                  expandedMenus.fiscal ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {(!sidebarCollapsed && expandedMenus.fiscal) && (
                <div className="pl-3 pr-1 pt-1 space-y-0.5">
                  <button
                    onClick={() => setActiveTab('fiscal')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
                      activeTab === 'fiscal' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" /> NF-e, Pix & SERPRO
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Seção Integrador */}
          <div className="pt-1">
            <button
              onClick={() => toggleMenu('integrador')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <span className="flex items-center gap-2.5">
                <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                {!sidebarCollapsed && <span>Integrador</span>}
              </span>
              {!sidebarCollapsed && (
                expandedMenus.integrador ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {(!sidebarCollapsed && expandedMenus.integrador) && (
              <div className="pl-3 pr-1 pt-1 space-y-0.5">
                <button
                  onClick={() => setActiveTab('portais')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'portais' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-sky-400" /> Anúncios nos Portais
                </button>
              </div>
            )}
          </div>

          {/* Seção Avaliação & Serviços */}
          <div className="pt-1">
            <button
              onClick={() => toggleMenu('servicos')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <span className="flex items-center gap-2.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {!sidebarCollapsed && <span>Avaliação & Serviços</span>}
              </span>
              {!sidebarCollapsed && (
                expandedMenus.servicos ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {(!sidebarCollapsed && expandedMenus.servicos) && (
              <div className="pl-3 pr-1 pt-1 space-y-0.5">
                <button
                  onClick={() => setActiveTab('servicos')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'servicos' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" /> Ordens de Serviço & Garantia 90D
                </button>
              </div>
            )}
          </div>

          {/* Seção Inteligência & IA */}
          <div className="pt-1">
            <button
              onClick={() => toggleMenu('ia')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                {!sidebarCollapsed && <span>Inteligência & IA</span>}
              </span>
              {!sidebarCollapsed && (
                expandedMenus.ia ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {(!sidebarCollapsed && expandedMenus.ia) && (
              <div className="pl-3 pr-1 pt-1 space-y-0.5">
                <button
                  onClick={() => setActiveTab('ia')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'ia' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Assistente & Automações
                  </span>
                  {systemAlerts.length > 0 && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                      {systemAlerts.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Seção Governança & Sistema */}
          <div className="pt-1">
            <button
              onClick={() => toggleMenu('governanca')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Governança & Sistema</span>}
              </span>
              {!sidebarCollapsed && (
                expandedMenus.governanca ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {(!sidebarCollapsed && expandedMenus.governanca) && (
              <div className="pl-3 pr-1 pt-1 space-y-0.5">
                {currentUser?.role === 'ADMIN' && (
                  <button
                    onClick={() => setActiveTab('equipe')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
                      activeTab === 'equipe' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Usuários & Permissões
                  </button>
                )}

                {(currentUser?.role === 'ADMIN' || currentUser?.role === 'GERENTE') && (
                  <button
                    onClick={() => setActiveTab('auditoria')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                      activeTab === 'auditoria' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Auditoria & Logs
                    </span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">
                      {auditMetrics?.total || auditLogs.length}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('operacao')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${
                    activeTab === 'operacao' ? 'text-white font-bold bg-[#6d3df5]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Saúde do Sistema
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Public Site Link */}
        <div className="p-3 border-t border-slate-900">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 transition"
            title="Ver Vitrine Site"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4 text-purple-400 shrink-0" />
              {!sidebarCollapsed && <span>Ver Vitrine Site</span>}
            </span>
            {!sidebarCollapsed && <ExternalLink className="w-3.5 h-3.5 text-slate-500" />}
          </Link>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR COM BREADCRUMBS & RECOLHIMENTO (Padrão Altimus) */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            {/* Botão de colapsar / expandir menu (< / >) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition cursor-pointer"
              title={sidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Breadcrumb Navigation Hierárquica */}
            <nav className="flex items-center gap-2 text-xs">
              {getBreadcrumb().map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-slate-300 font-bold">›</span>}
                  <span
                    className={
                      crumb.active
                        ? "font-extrabold text-[#6d3df5]"
                        : "text-slate-500 font-medium"
                    }
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>

            <span className="text-slate-300 hidden md:inline">|</span>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">The Rock Moto Shop</span>
              {canViewCosts ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> Acesso Total a Custos
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                  <ShieldAlert className="w-3 h-3" /> Custos Protegidos
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sino de Alertas & Automações (PRD 10) */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                title="Alertas do Sistema e Automações (PRD 10)"
              >
                <Bell className="w-5 h-5" />
                {systemAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {systemAlerts.length}
                  </span>
                )}
              </button>

              {/* Dropdown de Alertas */}
              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#6d3df5]" /> Alertas Inteligentes ({systemAlerts.length})
                    </span>
                    <button
                      onClick={handleRunAutomations}
                      className="text-[10px] font-bold text-purple-600 hover:underline cursor-pointer"
                    >
                      Executar Varredura ↺
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {systemAlerts.length > 0 ? (
                      systemAlerts.map((alt) => (
                        <div
                          key={alt.id}
                          className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                            alt.severity === 'CRITICAL'
                              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                              : 'bg-amber-50/70 border-amber-200 text-amber-950'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <strong className="text-[11px] font-bold block">{alt.title}</strong>
                            <button
                              onClick={() => handleDismissAlert(alt.id)}
                              className="text-[10px] font-bold opacity-60 hover:opacity-100 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-[10px] leading-relaxed opacity-90">{alt.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-4">
                        Nenhum alerta crítico ativo no momento.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModalMoto(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Moto
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* ======================================================== */}
          {/* ABA 0: INÍCIO (TELA PADRÃO ALTIMUS COM 4 CARDS & WHATSAPP)*/}
          {/* ======================================================== */}
          {activeTab === 'inicio' && (
            <div className="space-y-6">
              {/* Header de Boas-Vindas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5]">
                    Ponto de Partida
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Início · The Rock Moto Shop
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Acesso rápido aos principais fluxos de estoque, negociações, financeiro e canais integrados.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Sessão ativa como: <b className="text-slate-800">{currentUser?.name || 'Administrador'}</b> ({currentUser?.role})
                  </span>
                </div>
              </div>

              {/* 4 Cards de Acesso Rápido (Idênticos ao Print 01_inicio.png) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Veículos */}
                <div
                  onClick={() => setActiveTab('estoque')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Veículos
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-[#6d3df5] group-hover:text-white transition">
                      <Bike className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-slate-900">{totalMotosEmEstoque}</span>
                    <span className="text-xs text-slate-500 block mt-1 font-medium">
                      motos cadastradas no pátio
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-bold">
                    <span>Acessar Estoque</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Card 2: Negociações */}
                <div
                  onClick={() => setActiveTab('vendas')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Negociações
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                      <HandCoins className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-slate-900">{sales.length}</span>
                    <span className="text-xs text-slate-500 block mt-1 font-medium">
                      operações finalizadas
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                    <span>Ver Negociações</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Card 3: Contas a Pagar/Receber */}
                <div
                  onClick={() => setActiveTab('financeiro')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Contas a Pagar / Receber
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-slate-900">
                      {finance.length}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1 font-medium">
                      títulos no fluxo de caixa
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                    <span>Acessar Financeiro</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Card 4: Anúncios nos Portais */}
                <div
                  onClick={() => setActiveTab('portais')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Anúncios nos Portais
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition">
                      <Globe className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-slate-900">
                      {totalMotosEmEstoque}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1 font-medium">
                      anúncios Webmotors, OLX & Site
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-bold">
                    <span>Gerenciar Anúncios</span>
                    <span>→</span>
                  </div>
                </div>
              </div>

              {/* Banner Central WhatsApp & Inteligência (Print 01_inicio.png) */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-2xl space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Central de Comunicação Integrada
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                    WhatsApp & Automação Inteligente de Vendas
                  </h2>
                  <p className="text-xs md:text-sm text-purple-200/80 leading-relaxed">
                    Envie propostas oficiais em PDF, contratos com termo de garantia de 90 dias (CDC) e faça acompanhamento de oportunidades de compra e venda diretamente pelo WhatsApp.
                  </p>
                  <div className="pt-2 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setActiveTab('crm')}
                      className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl transition shadow cursor-pointer flex items-center gap-2"
                    >
                      <Users className="w-4 h-4 text-[#6d3df5]" /> Ver Oportunidades CRM
                    </button>
                    <button
                      onClick={() => setActiveTab('ia')}
                      className="px-4 py-2.5 bg-purple-600/40 hover:bg-purple-600/60 text-white text-xs font-bold rounded-xl border border-purple-400/30 transition cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> Assistente IA MotoFlow
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid de Recursos e Destaques Operacionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Tabela FIPE Oficial em Tempo Real</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Consulta automática à base FIPE para definição precisa do valor de mercado, custo de compra e margem de revenda.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">SERPRO RENAVE & NF-e Entrada/Saída</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Transferência eletrônica de propriedade para lojistas de motos, conformidade fiscal e baixas de estoque automáticas.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Ordens de Serviço & Garantia CDC 90D</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Controle de peças, serviços de oficina parceira, checklist de entrega e termo formal de garantia legal.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* ======================================================== */}
          {/* ABA 1: DASHBOARD / VISÃO GERAL                           */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5]">
                  Gestão Operacional de Estoque
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Painel de Controle do Estoque
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Métricas em tempo real de capital imobilizado, giro de pátio e pendências de preparação.
                </p>
              </div>

              {/* KPIs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Motos em Estoque
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-3xl font-black text-slate-900">{totalMotosEmEstoque}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {dashboardData?.kpis?.motosDisponiveis || 0} disponíveis
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                    {dashboardData?.kpis?.motosEmPreparacao || 0} em preparação na oficina
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Capital em Estoque
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-slate-900">
                      {canViewCosts
                        ? `R$ ${(dashboardData?.kpis?.capitalEstoque || 0).toLocaleString('pt-BR')}`
                        : 'Confidencial'}
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-600 mt-2 block font-bold">
                    Potencial de Venda: R$ {(dashboardData?.kpis?.valorPotencialVenda || 0).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Giro Médio do Pátio
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-3xl font-black text-slate-900">
                      {dashboardData?.kpis?.mediaDiasEstoque || 18} <span className="text-sm font-semibold text-slate-400">dias</span>
                    </span>
                    {(dashboardData?.kpis?.estoqueCriticoCount || 0) > 0 ? (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {dashboardData?.kpis?.estoqueCriticoCount} lentos
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Excelente giro
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                    Meta da loja: máximo 45 dias
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Pendências de Oficina
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-3xl font-black text-slate-900">
                      {dashboardData?.kpis?.totalPendenciasAbertas || 0}
                    </span>
                    {(dashboardData?.kpis?.totalPendenciasUrgentes || 0) > 0 && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        {dashboardData?.kpis?.totalPendenciasUrgentes} urgentes
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                    Revisões, laudos e documentação
                  </span>
                </div>
              </div>

              {/* Tabela de Motos Rápidas */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-purple-600" /> Motos no Pátio (Visão Rápida)
                  </h3>
                  <button
                    onClick={() => setActiveTab('estoque')}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    Ver estoque completo →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Moto & Placa</th>
                        <th className="py-3 px-4">Propriedade</th>
                        <th className="py-3 px-4">Dias em Estoque</th>
                        <th className="py-3 px-4">Situação</th>
                        <th className="py-3 px-4 text-right">Preço de Venda</th>
                        {canViewCosts && <th className="py-3 px-4 text-right">Margem Bruta</th>}
                        <th className="py-3 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {motos.slice(0, 5).map((m) => {
                        const days = calcDaysInStock(m.entryDate);
                        const cost = calcRealCost(m);
                        const margin = m.publicPrice > 0 ? ((m.publicPrice - cost) / m.publicPrice) * 100 : 0;

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              <div>{m.brand} {m.model}</div>
                              <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                {m.plate}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[11px] font-semibold text-slate-600">
                                {m.ownership === 'CONSIGNADA' ? 'Consignada' : 'Própria'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {days < 30 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  {days} dias
                                </span>
                              ) : days <= 45 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  {days} dias
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                  {days} dias (Lento)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              R$ {m.publicPrice.toLocaleString('pt-BR')}
                            </td>
                            {canViewCosts && (
                              <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                                {margin.toFixed(1)}%
                              </td>
                            )}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedMoto(m);
                                  setActiveTab('ficha');
                                }}
                                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition cursor-pointer"
                              >
                                Abrir Ficha
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 2: ESTOQUE DE MOTOS (PRD 03)                         */}
          {/* ======================================================== */}
          {activeTab === 'estoque' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5]">
                    Controle de Pátio & Veículos (PRD 03)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Estoque de Motos
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cadastro completo com FIPE, giro de estoque, fotos, opcionais e histórico de movimentação.
                  </p>
                </div>

                <button
                  onClick={() => setShowModalMoto(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Moto
                </button>
              </div>

              {/* Filtros e Busca */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchEstoque}
                    onChange={(e) => setSearchEstoque(e.target.value)}
                    placeholder="Buscar por placa, modelo, marca ou chassi..."
                    className="w-full bg-transparent border-0 outline-none text-xs text-slate-800 placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">Todas as situações</option>
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="EM_PREPARACAO">Em Preparação (Oficina)</option>
                    <option value="RESERVADA">Reservada</option>
                    <option value="VENDIDA">Vendida</option>
                  </select>

                  <select
                    value={ownershipFilter}
                    onChange={(e) => setOwnershipFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">Toda Propriedade</option>
                    <option value="PROPRIA">Própria</option>
                    <option value="CONSIGNADA">Consignada</option>
                  </select>

                  <select
                    value={giroFilter}
                    onChange={(e) => setGiroFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">Todo Giro</option>
                    <option value="RAPIDO">&lt; 30 dias (Giro Rápido)</option>
                    <option value="ATENCAO">30 a 45 dias</option>
                    <option value="CRITICO">&gt; 45 dias (Crítico/Lento)</option>
                  </select>
                </div>
              </div>

              {/* Tabela de Estoque */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                        <th className="py-3.5 px-4">Moto & Placa</th>
                        <th className="py-3.5 px-4">Ano / Km</th>
                        <th className="py-3.5 px-4">Propriedade</th>
                        <th className="py-3.5 px-4">Giro / Dias</th>
                        <th className="py-3.5 px-4">Situação</th>
                        {canViewCosts && <th className="py-3.5 px-4 text-right">Custo Real</th>}
                        <th className="py-3.5 px-4 text-right">Preço Venda</th>
                        {canViewCosts && <th className="py-3.5 px-4 text-right">Margem</th>}
                        <th className="py-3.5 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMotos.map((m) => {
                        const days = calcDaysInStock(m.entryDate);
                        const realCost = calcRealCost(m);
                        const margin = m.publicPrice > 0 ? ((m.publicPrice - realCost) / m.publicPrice) * 100 : 0;
                        const openTasksCount = m.tasks?.filter(t => t.status !== 'CONCLUIDA' && t.status !== 'CANCELADA').length || 0;

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="text-slate-900 font-extrabold">{m.brand} {m.model}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                      {m.plate}
                                    </span>
                                    {m.displacement && (
                                      <span className="text-[10px] text-slate-500 font-semibold">
                                        {m.displacement}cc
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              <div>{m.yearMfg}/{m.yearModel}</div>
                              <span className="text-[11px] text-slate-400">{m.mileage.toLocaleString('pt-BR')} km</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                m.ownership === 'CONSIGNADA' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {m.ownership === 'CONSIGNADA' ? 'Consignada' : 'Própria'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {days < 30 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  {days}d
                                </span>
                              ) : days <= 45 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  {days}d
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                  {days}d (Lento)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1 items-start">
                                {m.status === 'DISPONIVEL' && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Disponível
                                  </span>
                                )}
                                {m.status === 'EM_PREPARACAO' && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    Oficina / Prep
                                  </span>
                                )}
                                {m.status === 'RESERVADA' && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    Reservada
                                  </span>
                                )}
                                {m.status === 'VENDIDA' && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                    Vendida
                                  </span>
                                )}
                                {openTasksCount > 0 && (
                                  <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                                    <Wrench className="w-2.5 h-2.5" /> {openTasksCount} OS
                                  </span>
                                )}
                              </div>
                            </td>
                            {canViewCosts && (
                              <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                                R$ {realCost.toLocaleString('pt-BR')}
                              </td>
                            )}
                            <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
                              R$ {m.publicPrice.toLocaleString('pt-BR')}
                            </td>
                            {canViewCosts && (
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                                {margin.toFixed(1)}%
                              </td>
                            )}
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedMoto(m);
                                    setActiveTab('ficha');
                                  }}
                                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition cursor-pointer"
                                >
                                  Ficha
                                </button>
                                {m.status !== 'VENDIDA' && (
                                  <button
                                    onClick={() => handleOpenSaleModal(m)}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition cursor-pointer"
                                  >
                                    Vender
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 3: FICHA DA MOTO & CUSTOS (PRD 03 & 04)              */}
          {/* ======================================================== */}
          {activeTab === 'ficha' && selectedMoto && (
            <div className="space-y-6">
              {/* Header da Ficha */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-200 overflow-hidden flex items-center justify-center shrink-0">
                    {selectedMoto.imageUrl ? (
                      <img src={selectedMoto.imageUrl} alt={selectedMoto.model} className="w-full h-full object-cover" />
                    ) : (
                      <Bike className="w-8 h-8 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {selectedMoto.brand} {selectedMoto.model} {selectedMoto.version || ''}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        {selectedMoto.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-slate-500 font-medium">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        PLACA: {selectedMoto.plate}
                      </span>
                      <span>Ano: <b>{selectedMoto.yearMfg}/{selectedMoto.yearModel}</b></span>
                      <span>Km: <b>{selectedMoto.mileage.toLocaleString('pt-BR')} km</b></span>
                      {selectedMoto.displacement && <span>Cilindrada: <b>{selectedMoto.displacement} cc</b></span>}
                      <span>Propriedade: <b>{selectedMoto.ownership || 'Própria'}</b></span>
                      <span>Entrada há: <b>{calcDaysInStock(selectedMoto.entryDate)} dias</b></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setTargetStatus(selectedMoto.status);
                      setShowModalStatusChange(true);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Alterar Situação
                  </button>

                  {selectedMoto.status !== 'VENDIDA' && (
                    <button
                      onClick={() => handleOpenSaleModal(selectedMoto)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                      <HandCoins className="w-3.5 h-3.5" /> Vender esta Moto
                    </button>
                  )}
                </div>
              </div>

              {/* Régua Horizontal de Sub-Abas (Padrão Altimus 04_veiculo_novo_cadastro.png) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold no-scrollbar">
                {[
                  { key: 'principal', label: 'Principal', icon: Bike },
                  { key: 'compra', label: 'Informações da Compra', icon: Calendar },
                  { key: 'valores', label: 'Valores & Custos', icon: DollarSign },
                  { key: 'fipe', label: 'Tabela FIPE', icon: Tag },
                  { key: 'opcionais', label: 'Opcionais', icon: CheckSquare },
                  { key: 'pendencias', label: 'Pendências & Revisão', icon: Wrench, badge: selectedMoto.tasks?.filter(t => t.status !== 'CONCLUIDA').length },
                  { key: 'receitas_despesas', label: 'Receitas e Despesas', icon: Receipt, badge: selectedMoto.costs?.length },
                  { key: 'fotos', label: 'Fotos do Veículo', icon: Camera },
                  { key: 'historico', label: 'Histórico', icon: Clock },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = fichaSubTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setFichaSubTab(tab.key as any)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#6d3df5] text-white shadow-md shadow-purple-600/30'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SUB-ABA 1: PRINCIPAL (DADOS GERAIS) */}
              {fichaSubTab === 'principal' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <Bike className="w-4 h-4 text-purple-600" /> Identificação Cadastral do Veículo
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Marca</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedMoto.brand}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Modelo</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedMoto.model}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Versão / Cilindrada</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                            {selectedMoto.version || 'Padrão'} {selectedMoto.displacement ? `(${selectedMoto.displacement} cc)` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Ano Fabricação / Modelo</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedMoto.yearMfg} / {selectedMoto.yearModel}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Cor Predominante</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedMoto.color}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Quilometragem (KM)</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block font-mono">{selectedMoto.mileage.toLocaleString('pt-BR')} km</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Combustível</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedMoto.fuel || 'Gasolina'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Câmbio / Transmissão</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">{(selectedMoto as any).transmission || 'Manual (5 Marchas)'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Estilo / Categoria</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">{(selectedMoto as any).category || 'Trail / Street'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Observações Gerais e Descrição de Pátio
                      </h3>
                      <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed">
                        {(selectedMoto as any).notes || 'Veículo revisado com garantia legal de 90 dias conforme Código de Defesa do Consumidor (CDC art. 26). Laudo cautelar aprovado, documentação em dia e pronto para entrega imediata.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-600" /> Documentação & Registros
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500">Placa Oficial:</span>
                          <span className="font-mono font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {selectedMoto.plate}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500">Renavam:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {canViewCosts ? (selectedMoto.renavam || '12345678901') : '123456*****'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500">Chassi:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {canViewCosts ? (selectedMoto.chassis || '9C2JC4100MR001234') : '9C2JC4100MR******'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-500">Localização Física:</span>
                          <span className="font-bold text-purple-700">{selectedMoto.location || 'Showroom Principal'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-slate-500">Situação Cadastral:</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {selectedMoto.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA 2: INFORMAÇÕES DA COMPRA */}
              {fichaSubTab === 'compra' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" /> Dados da Aquisição e Entrada no Pátio
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">Data de Entrada no Estoque:</span>
                        <b className="font-mono text-slate-800">{new Date(selectedMoto.entryDate).toLocaleDateString('pt-BR')}</b>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">Tempo de Pátio:</span>
                        <b className="text-purple-700 font-bold">{calcDaysInStock(selectedMoto.entryDate)} dias em estoque</b>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">Modalidade de Propriedade:</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          {selectedMoto.ownership || 'Veículo Próprio (Estoque Loja)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">DUT / CRV em Mãos:</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Sim, assinado e reconhecido
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500">NF-e de Entrada:</span>
                        <span className="font-mono text-slate-700">NF-e nº 004821 (Emitida)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Contact className="w-4 h-4 text-purple-600" /> Fornecedor / Proprietário Anterior
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">Nome / Razão Social:</span>
                        <b className="text-slate-900">{selectedMoto.supplier?.name || 'Cliente Particular / Troca'}</b>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">CPF / CNPJ:</span>
                        <span className="font-mono text-slate-700">
                          {canViewCosts ? (selectedMoto.supplier?.tradeName || '082.914.829-12') : '***.***.829-**'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">Telefone / Contato:</span>
                        <span className="text-slate-700">{selectedMoto.supplier?.phone || '(48) 99876-5432'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500">Papel Cadastral:</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {(selectedMoto.supplier as any)?.roles || 'FORNECEDOR'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA 3: VALORES & CUSTOS */}
              {fichaSubTab === 'valores' && (
                <div className="space-y-6">
                  {canViewCosts ? (
                    <>
                      {(() => {
                        const totalCost = calcRealCost(selectedMoto);
                        const grossProfit = selectedMoto.publicPrice - totalCost;
                        const marginPerc = selectedMoto.publicPrice > 0 ? (grossProfit / selectedMoto.publicPrice) * 100 : 0;
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200">
                              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                                Custo Real Reconciliado
                              </span>
                              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                                R$ {totalCost.toLocaleString('pt-BR')}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                Aquisição + Reformas - Créditos
                              </span>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200">
                              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                                Preço de Venda Praticado
                              </span>
                              <span className="text-2xl font-black text-purple-700 mt-1 block font-mono">
                                R$ {selectedMoto.publicPrice.toLocaleString('pt-BR')}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                Preço de vitrine e contrato
                              </span>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200">
                              <span className="text-[11px] text-slate-400 font-bold uppercase block">
                                Lucro Bruto Projetado
                              </span>
                              <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">
                                R$ {grossProfit.toLocaleString('pt-BR')} ({marginPerc.toFixed(1)}%)
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                                Margem saudável sobre custo
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                      <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
                      <h3 className="text-base font-bold text-slate-800">Acesso Restrito a Custos e Margens</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Seu perfil de <b>Vendedor</b> não possui permissão para visualizar o custo de aquisição, despesas de oficina ou margens brutas da loja.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-ABA 4: TABELA FIPE */}
              {fichaSubTab === 'fipe' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-purple-900 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#6d3df5]" /> Cotação Oficial FIPE & Posicionamento de Mercado
                      </h3>
                      <p className="text-xs text-slate-400">
                        Índice referencial oficial de mercado da Fundação Instituto de Pesquisas Econômicas.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFipeTargetMoto(selectedMoto);
                        loadFipeBrands();
                        setShowModalFipeQuery(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Consultar / Atualizar FIPE Online
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Tabela FIPE Oficial</span>
                      <span className="text-xl font-black text-slate-900 mt-1 block font-mono">
                        R$ {(selectedMoto.fipeValue || selectedMoto.publicPrice * 1.05).toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                        Código: {selectedMoto.fipeCode || '005399-6'} · {selectedMoto.fipeRefMonth || 'Nov/2026'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Preço de Venda Praticado</span>
                      <span className="text-xl font-black text-purple-700 mt-1 block font-mono">
                        R$ {selectedMoto.publicPrice.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                        Preço competitivo de pátio
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Variação vs FIPE</span>
                      {(() => {
                        const fipe = selectedMoto.fipeValue || selectedMoto.publicPrice * 1.05;
                        const diff = selectedMoto.publicPrice - fipe;
                        const perc = ((diff / fipe) * 100).toFixed(1);
                        return (
                          <>
                            <span className="text-xl font-black text-emerald-600 mt-1 block font-mono">
                              {perc}%
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {diff < 0 ? 'Abaixo da Tabela FIPE' : 'Acima da Tabela FIPE'}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA 5: OPCIONAIS */}
              {fichaSubTab === 'opcionais' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-purple-600" /> Opcionais e Acessórios Instalados
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[
                      'Freios ABS',
                      'Freio a Disco Dianteiro',
                      'Freio a Disco Traseiro',
                      'Partida Elétrica',
                      'Injeção Eletrônica',
                      'Painel Digital TFT',
                      'Alarme / Sensor Presença',
                      'Baú / Top Case',
                      'Protetor de Carenagem',
                      'Escapamento Esportivo',
                      'Pneus Novos',
                      'Manual do Proprietário',
                      'Chave Reserva',
                    ].map((opt, i) => (
                      <div
                        key={i}
                        className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-purple-900"
                      >
                        <Check className="w-4 h-4 text-[#6d3df5] shrink-0" />
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-ABA 6: PENDÊNCIAS & REVISÃO (OS) */}
              {fichaSubTab === 'pendencias' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          Ordens de Serviço e Pendências de Preparação
                        </h3>
                        <p className="text-xs text-slate-400">
                          Controle de revisões mecânicas, peças, laudo cautelar e estética antes de liberar para venda.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowModalTask(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Nova Pendência / OS
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedMoto.tasks && selectedMoto.tasks.length > 0 ? (
                        selectedMoto.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              task.status === 'CONCLUIDA'
                                ? 'bg-slate-50 border-slate-200 opacity-75'
                                : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleToggleTask(task.id, task.status)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                                  task.status === 'CONCLUIDA'
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-slate-300 hover:border-purple-600 text-transparent hover:text-purple-600'
                                }`}
                                title="Alternar status da pendência"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className={`text-xs ${task.status === 'CONCLUIDA' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                    {task.title}
                                  </strong>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    task.priority === 'URGENTE' ? 'bg-rose-100 text-rose-800' :
                                    task.priority === 'ALTA' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                                    {task.type}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className="text-[11px] text-slate-500 mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                                  {task.partner && (
                                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                                      <Building2 className="w-3 h-3 text-slate-400" />
                                      {task.partner.tradeName || task.partner.name}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                  {task.costEstimate && task.costEstimate > 0 && (
                                    <span className="font-mono font-bold text-slate-700">
                                      Orçado: R$ {task.costEstimate.toLocaleString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                task.status === 'CONCLUIDA'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : task.status === 'EM_ANDAMENTO'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {task.status}
                              </span>

                              {task.partner?.phone && (
                                <a
                                  href={`https://wa.me/55${task.partner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Gostaria de verificar a OS sobre a moto ${selectedMoto.brand} ${selectedMoto.model} (${selectedMoto.plate}): ${task.title}`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  title="Cobrar oficina no WhatsApp"
                                >
                                  <Phone className="w-3 h-3" /> WhatsApp
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          Nenhuma pendência ou revisão registrada para esta moto.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA 7: RECEITAS E DESPESAS (CUSTOS) */}
              {fichaSubTab === 'receitas_despesas' && (
                <div className="space-y-6">
                  {canViewCosts ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">
                            Extrato de Despesas e Custos Vinculados ao Veículo
                          </h3>
                          <p className="text-xs text-slate-400">
                            Lançamentos diretos de aquisição, peças, oficina parceira e taxas.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowModalCost(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Custo / Despesa
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                              <th className="pb-3">Descrição da Despesa</th>
                              <th className="pb-3">Categoria</th>
                              <th className="pb-3">Fornecedor / Oficina</th>
                              <th className="pb-3">Data</th>
                              <th className="pb-3 text-right">Valor</th>
                              <th className="pb-3 text-center">Status</th>
                              <th className="pb-3 text-center">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedMoto.costs && selectedMoto.costs.length > 0 ? (
                              selectedMoto.costs.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 transition">
                                  <td className="py-3 font-semibold text-slate-800">
                                    {c.description}
                                    {c.isCredit && (
                                      <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        Crédito/Estorno
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3">
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                      {c.category}
                                    </span>
                                  </td>
                                  <td className="py-3 text-slate-600">
                                    {c.supplier ? (c.supplier.tradeName || c.supplier.name) : '—'}
                                  </td>
                                  <td className="py-3 text-slate-400 font-mono text-[11px]">
                                    {new Date(c.date).toLocaleDateString('pt-BR')}
                                  </td>
                                  <td className={`py-3 text-right font-mono font-bold ${c.isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {c.isCredit ? '- ' : ''}R$ {c.amount.toLocaleString('pt-BR')}
                                  </td>
                                  <td className="py-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      {c.status || 'PAGO'}
                                    </span>
                                  </td>
                                  <td className="py-3 text-center">
                                    <button
                                      onClick={() => handleDeleteCost(c.id)}
                                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                                      title="Remover custo"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-400">
                                  Nenhum custo lançado para este veículo.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                      <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
                      <h3 className="text-base font-bold text-slate-800">Acesso Restrito a Custos</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Seu perfil de <b>Vendedor</b> não possui permissão para visualizar despesas financeiras detalhadas da loja.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-ABA 8: FOTOS DO VEÍCULO */}
              {fichaSubTab === 'fotos' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-purple-600" /> Galeria de Fotos & Vitrine Portais
                      </h3>
                      <p className="text-xs text-slate-400">
                        Fotos sincronizadas automaticamente com a Vitrine Pública e Portais (Webmotors, OLX).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="relative group rounded-2xl overflow-hidden border border-purple-300 shadow-sm bg-slate-50 aspect-video flex items-center justify-center">
                      {selectedMoto.imageUrl ? (
                        <img
                          src={selectedMoto.imageUrl}
                          alt={selectedMoto.model}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <Bike className="w-12 h-12 text-slate-300" />
                      )}
                      <div className="absolute top-2 left-2 bg-[#6d3df5] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                        Foto Principal (Capa)
                      </div>
                    </div>

                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center space-y-2 hover:border-purple-400 transition cursor-pointer">
                      <Camera className="w-8 h-8 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">Adicionar Mais Fotos</span>
                      <span className="text-[10px] text-slate-400">Upload JPG/PNG até 5MB</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA 9: HISTÓRICO DE MOVIMENTAÇÕES */}
              {fichaSubTab === 'historico' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-slate-900">
                    Histórico Imutável de Transições de Situação
                  </h3>
                  <div className="relative pl-6 border-l-2 border-purple-200 space-y-6 my-4">
                    {selectedMoto.statusHistory && selectedMoto.statusHistory.length > 0 ? (
                      selectedMoto.statusHistory.map((hist) => (
                        <div key={hist.id} className="relative">
                          <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white"></span>
                          <div className="text-xs">
                            <span className="font-bold text-slate-900">
                              Mudança de {hist.fromStatus} → <b className="text-purple-700">{hist.toStatus}</b>
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {new Date(hist.createdAt).toLocaleString('pt-BR')} · Por {hist.userName || 'Sistema'}
                            </span>
                            {hist.reason && (
                              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                                {hist.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400">Nenhum histórico registrado além da entrada inicial.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 4: NEGOCIAÇÕES & VENDAS                              */}
          {/* ======================================================== */}
          {activeTab === 'vendas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5]">
                    Operações Concluídas (PRD 06)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Vendas & Negociações
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Histórico de vendas realizadas, apuração de margem e emissão de contratos.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3.5 px-4">Data</th>
                        <th className="py-3.5 px-4">Moto Vendida</th>
                        <th className="py-3.5 px-4">Comprador</th>
                        <th className="py-3.5 px-4">Modalidade</th>
                        <th className="py-3.5 px-4 text-right">Valor Venda</th>
                        {canViewCosts && <th className="py-3.5 px-4 text-right">Margem Bruta</th>}
                        <th className="py-3.5 px-4 text-center">Contrato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sales.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {new Date(s.saleDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {s.motorcycle.brand} {s.motorcycle.model}
                            <span className="block text-[10px] font-mono text-purple-700">{s.motorcycle.plate}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <b>{s.customer.name}</b>
                            <span className="block text-[10px] text-slate-400">{s.customer.phone}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {s.paymentType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                            R$ {s.salePrice.toLocaleString('pt-BR')}
                          </td>
                          {canViewCosts && (
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                              R$ {s.grossProfit.toLocaleString('pt-BR')}
                            </td>
                          )}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleOpenSaleContracts(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition cursor-pointer"
                              title="Visualizar ou emitir Contrato de Compra e Venda e Termo de Garantia"
                            >
                              <Printer className="w-3.5 h-3.5" /> Contrato & Garantia
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 5: PESSOAS & CLIENTES (PRD 02)                       */}
          {/* ======================================================== */}
          {activeTab === 'pessoas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5]">
                    Gestão Unificada de Terceiros (PRD 02)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Pessoas, Clientes & Fornecedores
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clientes, oficinas parceiras, despachantes e fornecedores de motos.
                  </p>
                </div>

                <button
                  onClick={() => setShowModalPerson(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Pessoa / Empresa
                </button>
              </div>

              {/* Filtros */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchPeople}
                    onChange={(e) => setSearchPeople(e.target.value)}
                    placeholder="Buscar por nome, documento ou telefone..."
                    className="w-full bg-transparent border-0 outline-none text-xs text-slate-800 placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={peopleRoleFilter}
                    onChange={(e) => setPeopleRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">Todos os Papéis</option>
                    <option value="CLIENTE">Clientes</option>
                    <option value="FORNECEDOR">Fornecedores</option>
                    <option value="OFICINA">Oficinas / Mecânicas</option>
                    <option value="DESPACHANTE">Despachantes</option>
                  </select>
                </div>
              </div>

              {/* Tabela de Pessoas */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3.5 px-4">Nome / Razão</th>
                        <th className="py-3.5 px-4">Tipo & Documento</th>
                        <th className="py-3.5 px-4">Papéis</th>
                        <th className="py-3.5 px-4">Contato & WhatsApp</th>
                        <th className="py-3.5 px-4">Cidade/UF</th>
                        <th className="py-3.5 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPeople.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{p.name}</div>
                            {p.tradeName && <span className="text-[11px] text-purple-700 block font-normal">{p.tradeName}</span>}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                            <span className="text-[10px] font-bold text-slate-400 mr-1">{p.personType}:</span>
                            {p.document || 'Não informado'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              {p.roles}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <a
                              href={`https://wa.me/55${p.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                            >
                              <Phone className="w-3 h-3" /> {p.phone}
                            </a>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {p.city ? `${p.city}/${p.state || 'SC'}` : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <a
                              href={`https://wa.me/55${p.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá, tudo bem? Mensagem da The Rock Moto Shop.')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition"
                            >
                              Conversar
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ======================================================== */}
          {/* ABA 6: CRM & LEADS (PRD 08)                               */}
          {/* ======================================================== */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              {/* Header do CRM */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5]">
                    Funil de Vendas & Esteira Comercial (PRD 08)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    CRM, Pipeline & Atendimento
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gestão integrada de leads da vitrine, WhatsApp, OLX e balcão com histórico de interações e conversão ágil.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                    <button
                      onClick={() => setCrmViewMode('kanban')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                        crmViewMode === 'kanban'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Kanban (Funil)
                    </button>
                    <button
                      onClick={() => setCrmViewMode('lista')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                        crmViewMode === 'lista'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Lista Detalhada
                    </button>
                  </div>

                  <button
                    onClick={() => setShowModalNewLead(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Novo Lead Manual
                  </button>
                </div>
              </div>

              {/* Métricas e KPIs do Funil */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Leads</span>
                  <strong className="text-2xl font-black text-slate-900 mt-1 block">
                    {crmMetrics?.total ?? leads.length}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-medium">Cadastrados no sistema</span>
                </div>

                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 shadow-xs">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Novas Oportunidades</span>
                  <strong className="text-2xl font-black text-purple-800 mt-1 block">
                    {crmMetrics?.novos ?? leads.filter((l) => l.stage === 'NOVO').length}
                  </strong>
                  <span className="text-[10px] text-purple-600 font-medium">Aguardando 1º contato</span>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Em Negociação</span>
                  <strong className="text-2xl font-black text-amber-800 mt-1 block">
                    {leads.filter((l) => ['CONTATO', 'VISITA_AGENDADA', 'PROPOSTA'].includes(l.stage)).length}
                  </strong>
                  <span className="text-[10px] text-amber-600 font-medium">Visitas e propostas ativas</span>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Vendas Concluídas</span>
                  <strong className="text-2xl font-black text-emerald-800 mt-1 block">
                    {crmMetrics?.ganhos ?? leads.filter((l) => l.stage === 'GANHO').length}
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-medium">Fechadas com sucesso</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Taxa de Conversão</span>
                  <strong className="text-2xl font-black text-indigo-700 mt-1 block">
                    {(() => {
                      const finalizados = leads.filter((l) => ['GANHO', 'PERDIDO'].includes(l.stage)).length;
                      const ganhos = leads.filter((l) => l.stage === 'GANHO').length;
                      if (!finalizados) return '0%';
                      return `${Math.round((ganhos / finalizados) * 100)}%`;
                    })()}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-medium">Ganhos / Finalizados</span>
                </div>
              </div>

              {/* Origens dos Leads */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-600 flex items-center gap-1.5 mr-2">
                  <Tag className="w-3.5 h-3.5 text-[#6d3df5]" /> Origens:
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700">
                  🌐 Vitrine Web: <strong className="text-purple-600">{leads.filter(l => l.source === 'VITRINE_SITE').length}</strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700">
                  💬 WhatsApp: <strong className="text-emerald-600">{leads.filter(l => l.source === 'WHATSAPP').length}</strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700">
                  🚗 Webmotors: <strong className="text-red-600">{leads.filter(l => l.source === 'WEBMOTORS').length}</strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700">
                  📦 OLX: <strong className="text-orange-600">{leads.filter(l => l.source === 'OLX').length}</strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700">
                  🏬 Balcão Presencial: <strong className="text-blue-600">{leads.filter(l => ['BALCAO_PRESENCIAL', 'PRESENCIAL'].includes(l.source)).length}</strong>
                </span>
              </div>

              {/* MODO 1: KANBAN COM 5 ESTÁGIOS */}
              {crmViewMode === 'kanban' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    {/* COLUNA 1: NOVO */}
                    <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 space-y-3 min-h-[500px]">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Novos Leads
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
                          {leads.filter((l) => l.stage === 'NOVO').length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {leads
                          .filter((l) => l.stage === 'NOVO')
                          .map((lead) => (
                            <div key={lead.id} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-2.5">
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <strong className="text-xs font-bold text-slate-900 block">{lead.name}</strong>
                                  <span className="text-[10px] text-slate-500 font-medium">{lead.phone}</span>
                                </div>
                                <span className="text-[9px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full border border-purple-100">
                                  {lead.source.replace('_', ' ')}
                                </span>
                              </div>

                              {lead.motorcycle && (
                                <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                                  <span>🏍️ <b>{lead.motorcycle.brand} {lead.motorcycle.model}</b></span>
                                  {lead.motorcycle.publicPrice && (
                                    <span className="text-[10px] font-bold text-purple-700">
                                      R$ {lead.motorcycle.publicPrice.toLocaleString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              )}

                              {lead.budget && (
                                <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50/60 px-2 py-1 rounded border border-emerald-100">
                                  Orçamento: R$ {lead.budget.toLocaleString('pt-BR')}
                                </div>
                              )}

                              {lead.nextAction && (
                                <div className="text-[10px] text-slate-600 bg-amber-50/70 p-1.5 rounded border border-amber-200/60 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="truncate">{lead.nextAction}</span>
                                </div>
                              )}

                              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                <a
                                  href={buildWhatsAppUrl(lead.phone, getWhatsAppTemplate(lead, 'primeiro_contato'))}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                                  title="Iniciar conversa no WhatsApp com template de boas-vindas"
                                >
                                  <Phone className="w-3 h-3" /> WhatsApp
                                </a>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenLeadDetails(lead)}
                                    className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded cursor-pointer"
                                  >
                                    Ficha
                                  </button>
                                  <button
                                    onClick={() => handleUpdateLeadStage(lead.id, 'CONTATO')}
                                    className="text-[10px] font-bold text-purple-600 hover:bg-purple-50 px-2 py-1 rounded border border-purple-200 cursor-pointer"
                                  >
                                    Contato →
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* COLUNA 2: CONTATO */}
                    <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 space-y-3 min-h-[500px]">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Em Atendimento
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
                          {leads.filter((l) => l.stage === 'CONTATO').length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {leads
                          .filter((l) => l.stage === 'CONTATO')
                          .map((lead) => (
                            <div key={lead.id} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-2.5">
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <strong className="text-xs font-bold text-slate-900 block">{lead.name}</strong>
                                  <span className="text-[10px] text-slate-500 font-medium">{lead.phone}</span>
                                </div>
                                <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
                                  {lead.source.replace('_', ' ')}
                                </span>
                              </div>

                              {lead.motorcycle && (
                                <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                                  <span>🏍️ <b>{lead.motorcycle.brand} {lead.motorcycle.model}</b></span>
                                  {lead.motorcycle.publicPrice && (
                                    <span className="text-[10px] font-bold text-blue-700">
                                      R$ {lead.motorcycle.publicPrice.toLocaleString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              )}

                              {lead.nextAction && (
                                <div className="text-[10px] text-slate-600 bg-amber-50/70 p-1.5 rounded border border-amber-200/60 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="truncate">{lead.nextAction}</span>
                                </div>
                              )}

                              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                <a
                                  href={buildWhatsAppUrl(lead.phone, getWhatsAppTemplate(lead, 'test_ride'))}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                                  title="Convidar para Test-Ride no showroom"
                                >
                                  <Phone className="w-3 h-3" /> WhatsApp
                                </a>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenLeadDetails(lead)}
                                    className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded cursor-pointer"
                                  >
                                    Ficha
                                  </button>
                                  <button
                                    onClick={() => handleUpdateLeadStage(lead.id, 'VISITA_AGENDADA')}
                                    className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 cursor-pointer"
                                  >
                                    Visita →
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* COLUNA 3: VISITA AGENDADA */}
                    <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 space-y-3 min-h-[500px]">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Visita / Test-Ride
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
                          {leads.filter((l) => l.stage === 'VISITA_AGENDADA').length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {leads
                          .filter((l) => l.stage === 'VISITA_AGENDADA')
                          .map((lead) => (
                            <div key={lead.id} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-2.5">
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <strong className="text-xs font-bold text-slate-900 block">{lead.name}</strong>
                                  <span className="text-[10px] text-slate-500 font-medium">{lead.phone}</span>
                                </div>
                                <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                  {lead.source.replace('_', ' ')}
                                </span>
                              </div>

                              {lead.motorcycle && (
                                <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                                  <span>🏍️ <b>{lead.motorcycle.brand} {lead.motorcycle.model}</b></span>
                                  {lead.motorcycle.publicPrice && (
                                    <span className="text-[10px] font-bold text-amber-700">
                                      R$ {lead.motorcycle.publicPrice.toLocaleString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              )}

                              {lead.nextAction && (
                                <div className="text-[10px] text-slate-600 bg-amber-50/70 p-1.5 rounded border border-amber-200/60 flex items-center gap-1">
                                  <CalendarCheck className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="truncate">{lead.nextAction}</span>
                                </div>
                              )}

                              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                <a
                                  href={buildWhatsAppUrl(lead.phone, getWhatsAppTemplate(lead, 'test_ride'))}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                                >
                                  <Phone className="w-3 h-3" /> WhatsApp
                                </a>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenLeadDetails(lead)}
                                    className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded cursor-pointer"
                                  >
                                    Ficha
                                  </button>
                                  <button
                                    onClick={() => handleUpdateLeadStage(lead.id, 'PROPOSTA')}
                                    className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-200 cursor-pointer"
                                  >
                                    Proposta →
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* COLUNA 4: PROPOSTA */}
                    <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 space-y-3 min-h-[500px]">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Proposta & Finan.
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
                          {leads.filter((l) => l.stage === 'PROPOSTA').length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {leads
                          .filter((l) => l.stage === 'PROPOSTA')
                          .map((lead) => (
                            <div key={lead.id} className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-xs hover:shadow-md transition space-y-2.5">
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <strong className="text-xs font-bold text-slate-900 block">{lead.name}</strong>
                                  <span className="text-[10px] text-slate-500 font-medium">{lead.phone}</span>
                                </div>
                                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                                  {lead.source.replace('_', ' ')}
                                </span>
                              </div>

                              {lead.motorcycle && (
                                <div className="text-[11px] text-slate-700 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                                  <span>🏍️ <b>{lead.motorcycle.brand} {lead.motorcycle.model}</b></span>
                                  {lead.motorcycle.publicPrice && (
                                    <span className="text-[10px] font-bold text-indigo-700">
                                      R$ {lead.motorcycle.publicPrice.toLocaleString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              )}

                              {lead.budget && (
                                <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                  Proposta: R$ {lead.budget.toLocaleString('pt-BR')}
                                </div>
                              )}

                              <div className="pt-2 flex flex-col gap-1.5 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                  <a
                                    href={buildWhatsAppUrl(lead.phone, getWhatsAppTemplate(lead, 'financiamento'))}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                                    title="Enviar proposta/simulação no WhatsApp"
                                  >
                                    <Phone className="w-3 h-3" /> WhatsApp
                                  </a>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleOpenLeadDetails(lead)}
                                      className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded cursor-pointer"
                                    >
                                      Ficha
                                    </button>
                                    <button
                                      onClick={() => handleUpdateLeadStage(lead.id, 'PERDIDO')}
                                      className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded border border-rose-200 cursor-pointer"
                                    >
                                      Perdido
                                    </button>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleConvertLeadToSale(lead)}
                                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-lg shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> Converter em Venda
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* COLUNA 5: GANHO */}
                    <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 space-y-3 min-h-[500px]">
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Vendas Concluídas
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full shadow-xs border border-emerald-200">
                          {leads.filter((l) => l.stage === 'GANHO').length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {leads
                          .filter((l) => l.stage === 'GANHO')
                          .map((lead) => (
                            <div key={lead.id} className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs space-y-2">
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <strong className="text-xs font-bold text-slate-900 block">{lead.name}</strong>
                                  <span className="text-[10px] text-slate-500 font-medium">{lead.phone}</span>
                                </div>
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                  GANHO 🎉
                                </span>
                              </div>

                              {lead.motorcycle && (
                                <div className="text-[11px] text-slate-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                                  Moto: <b>{lead.motorcycle.brand} {lead.motorcycle.model}</b>
                                </div>
                              )}

                              <p className="text-[10px] text-emerald-700 font-medium">
                                Negociação convertida com sucesso pela equipe comercial.
                              </p>

                              <button
                                onClick={() => handleOpenLeadDetails(lead)}
                                className="w-full text-center py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer"
                              >
                                Ver Histórico
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO INFERIOR: OPORTUNIDADES PERDIDAS */}
                  {leads.filter((l) => l.stage === 'PERDIDO').length > 0 && (
                    <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                          <UserX className="w-4 h-4 text-rose-600" /> Oportunidades Perdidas ({leads.filter((l) => l.stage === 'PERDIDO').length})
                        </span>
                        <span className="text-xs text-rose-600 font-medium">
                          Motivos registrados para melhoria contínua de preços e abordagem
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {leads
                          .filter((l) => l.stage === 'PERDIDO')
                          .map((lead) => (
                            <div key={lead.id} className="bg-white p-3 rounded-xl border border-rose-200 shadow-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <strong className="text-xs font-bold text-slate-900">{lead.name}</strong>
                                <span className="text-[10px] text-slate-400">{lead.phone}</span>
                              </div>
                              {lead.motorcycle && (
                                <div className="text-[11px] text-slate-600">
                                  Moto: <b>{lead.motorcycle.brand} {lead.motorcycle.model}</b>
                                </div>
                              )}
                              <div className="bg-rose-50 p-2 rounded border border-rose-100 text-[10px] text-rose-700">
                                <strong>Motivo da Perda:</strong> {lead.lossReason || 'Não informado'}
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <button
                                  onClick={() => handleOpenLeadDetails(lead)}
                                  className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                                >
                                  Ver Histórico
                                </button>
                                <button
                                  onClick={() => handleUpdateLeadStage(lead.id, 'CONTATO')}
                                  className="text-[10px] font-bold text-purple-600 hover:underline cursor-pointer"
                                >
                                  Reativar Lead ↺
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODO 2: LISTA DETALHADA */}
              {crmViewMode === 'lista' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-4">Cliente / Contato</th>
                          <th className="py-3 px-4">Origem</th>
                          <th className="py-3 px-4">Interesse / Moto</th>
                          <th className="py-3 px-4">Orçamento</th>
                          <th className="py-3 px-4">Vendedor</th>
                          <th className="py-3 px-4">Estágio</th>
                          <th className="py-3 px-4">Próxima Ação</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4">
                              <strong className="text-slate-900 block font-bold">{lead.name}</strong>
                              <span className="text-[10px] text-slate-500">{lead.phone}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                                {lead.source.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {lead.motorcycle ? (
                                <span><b>{lead.motorcycle.brand} {lead.motorcycle.model}</b></span>
                              ) : (
                                <span className="text-slate-400">Geral</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {lead.budget ? (
                                <span className="font-bold text-emerald-700">
                                  R$ {lead.budget.toLocaleString('pt-BR')}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {lead.assignedTo?.name || 'Não atribuído'}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  lead.stage === 'NOVO'
                                    ? 'bg-purple-100 text-purple-800'
                                    : lead.stage === 'CONTATO'
                                    ? 'bg-blue-100 text-blue-800'
                                    : lead.stage === 'VISITA_AGENDADA'
                                    ? 'bg-amber-100 text-amber-800'
                                    : lead.stage === 'PROPOSTA'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : lead.stage === 'GANHO'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {lead.stage}
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-[200px] truncate text-[11px] text-slate-500">
                              {lead.nextAction || '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={buildWhatsAppUrl(lead.phone, getWhatsAppTemplate(lead, 'primeiro_contato'))}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                                  title="WhatsApp"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleOpenLeadDetails(lead)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition cursor-pointer"
                                >
                                  Ficha
                                </button>
                                {lead.stage === 'PROPOSTA' && (
                                  <button
                                    onClick={() => handleConvertLeadToSale(lead)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                                  >
                                    Vender
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 7: FINANCEIRO & DRE GERENCIAL (PRD 07)               */}
          {/* ======================================================== */}
          {activeTab === 'financeiro' && canViewCosts && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5]">
                    Gestão Financeira & DRE (PRD 07)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Financeiro, Caixa & DRE Gerencial
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controle de contas a pagar e receber, conciliação bancária e apuração do resultado mensal.
                  </p>
                </div>

                <button
                  onClick={() => setShowModalFinanceEntry(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Novo Título / Despesa
                </button>
              </div>

              {/* KPIs de Caixa & Títulos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Disponível em Bancos & Caixa
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      R$ {(financialKpis?.saldoTotalContas || 0).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      {financialAccounts.length} contas
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                    Itaú, Santander e Caixa Showroom
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Contas a Receber (Previsto)
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-emerald-600 font-mono">
                      R$ {(financialKpis?.totalAReceber || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-2 block font-medium">
                    Entradas de vendas e retornos bancários
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Contas a Pagar (Previsto)
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-rose-600 font-mono">
                      R$ {(financialKpis?.totalAPagar || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                    Aluguel, oficinas, peças e impostos
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Resultado DRE Líquido ({financialDre?.periodo || 'Mês'})
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      R$ {(financialDre?.lucroLiquido || 0).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {financialDre?.margemLiquidaPercentual || 0}% margem
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-600 mt-2 block font-bold">
                    Regime: {financeRegime === 'CAIXA' ? 'Caixa (Realizado)' : 'Competência (Fato)'}
                  </span>
                </div>
              </div>

              {/* Sub-Tabs do Financeiro */}
              <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
                <button
                  onClick={() => setFinanceSubTab('titulos')}
                  className={`pb-3 transition cursor-pointer flex items-center gap-1.5 ${
                    financeSubTab === 'titulos'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" /> Títulos & Contas a Pagar/Receber
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {financialEntries.length}
                  </span>
                </button>
                <button
                  onClick={() => setFinanceSubTab('dre')}
                  className={`pb-3 transition cursor-pointer flex items-center gap-1.5 ${
                    financeSubTab === 'dre'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> DRE Gerencial Completa
                </button>
                <button
                  onClick={() => setFinanceSubTab('contas')}
                  className={`pb-3 transition cursor-pointer flex items-center gap-1.5 ${
                    financeSubTab === 'contas'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" /> Contas Bancárias & Caixas
                  <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                    {financialAccounts.length}
                  </span>
                </button>
              </div>

              {/* SUB-ABA 1: TÍTULOS FINANCEIROS */}
              {financeSubTab === 'titulos' && (
                <div className="space-y-4">
                  {/* Filtros */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={financeTypeFilter}
                        onChange={(e) => setFinanceTypeFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="ALL">Todas as Movimentações</option>
                        <option value="RECEITA">Apenas Receitas (Entradas)</option>
                        <option value="DESPESA">Apenas Despesas (Saídas)</option>
                      </select>

                      <select
                        value={financeStatusFilter}
                        onChange={(e) => setFinanceStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="ALL">Todos os Status</option>
                        <option value="PENDENTE">Pendentes</option>
                        <option value="PAGO">Pagos / Liquidados</option>
                        <option value="CANCELADO">Cancelados</option>
                      </select>
                    </div>

                    <span className="text-xs text-slate-400">
                      Total listado: <b>{financialEntries.length} lançamentos</b>
                    </span>
                  </div>

                  {/* Tabela de Títulos */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                            <th className="py-3.5 px-4">Descrição do Lançamento</th>
                            <th className="py-3.5 px-4">Tipo & Categoria</th>
                            <th className="py-3.5 px-4">Vencimento</th>
                            <th className="py-3.5 px-4">Vínculo / Parceiro</th>
                            <th className="py-3.5 px-4 text-right">Valor (R$)</th>
                            <th className="py-3.5 px-4 text-center">Status</th>
                            <th className="py-3.5 px-4 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {financialEntries
                            .filter((f) => financeTypeFilter === 'ALL' || f.type === financeTypeFilter)
                            .filter((f) => financeStatusFilter === 'ALL' || f.status === financeStatusFilter)
                            .map((f) => {
                              const isOverdue = f.status === 'PENDENTE' && new Date(f.dueDate) < new Date();

                              return (
                                <tr key={f.id} className="hover:bg-slate-50/80 transition">
                                  <td className="py-3.5 px-4 font-bold text-slate-900">
                                    <div>{f.description}</div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-normal">
                                      <span>Centro: <b>{f.costCenter || 'SHOWROOM'}</b></span>
                                      {f.paymentMethod && <span>Forma: <b>{f.paymentMethod}</b></span>}
                                      {f.financialAccount && (
                                        <span className="text-purple-600 font-semibold">
                                          Conta: {f.financialAccount.name}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold block w-fit mb-1 ${
                                        f.type === 'RECEITA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                      }`}
                                    >
                                      {f.type}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      {f.category}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-[11px]">
                                    <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                                      {new Date(f.dueDate).toLocaleDateString('pt-BR')}
                                    </span>
                                    {isOverdue && (
                                      <span className="block text-[9px] font-extrabold text-rose-600 uppercase">
                                        Vencido
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-700">
                                    {f.customer ? (
                                      <div>
                                        <b>{f.customer.tradeName || f.customer.name}</b>
                                        <span className="block text-[10px] text-slate-400">{f.customer.roles}</span>
                                      </div>
                                    ) : f.motorcycle ? (
                                      <div>
                                        <b>{f.motorcycle.brand} {f.motorcycle.model}</b>
                                        <span className="block text-[10px] font-mono text-purple-700">{f.motorcycle.plate}</span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className={`py-3.5 px-4 text-right font-mono font-black text-sm ${f.type === 'RECEITA' ? 'text-emerald-700' : 'text-slate-900'}`}>
                                    {f.type === 'RECEITA' ? '+ ' : '- '}R$ {f.amount.toLocaleString('pt-BR')}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    {f.status === 'PAGO' ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Liquidado / Pago
                                      </span>
                                    ) : f.status === 'CANCELADO' ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                        Cancelado
                                      </span>
                                    ) : isOverdue ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        Vencido
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        Pendente
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {f.status === 'PENDENTE' && (
                                        <button
                                          onClick={() => handleOpenBaixa(f)}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                                          title="Efetuar Baixa / Confirmar Pagamento"
                                        >
                                          {f.type === 'RECEITA' ? 'Receber' : 'Pagar'}
                                        </button>
                                      )}
                                      {f.status === 'PENDENTE' && (
                                        <button
                                          onClick={() => handleCancelarTitulo(f.id)}
                                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition cursor-pointer"
                                          title="Cancelar Título"
                                        >
                                          ✕
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteTitulo(f.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA 2: DRE GERENCIAL ESTRUTURADA */}
              {financeSubTab === 'dre' && (
                <div className="space-y-6">
                  {/* Controles de Regime DRE */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" /> DRE Gerencial do Exercício
                      </h3>
                      <p className="text-xs text-slate-400">
                        Período: <b>{financialDre?.periodo || 'Mês Atual'}</b> · Demonstrativo gerencial de apuração de resultado
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => {
                          setFinanceRegime('CAIXA');
                          loadFinancialData('CAIXA');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          financeRegime === 'CAIXA' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Regime de Caixa (Liquidações)
                      </button>
                      <button
                        onClick={() => {
                          setFinanceRegime('COMPETENCIA');
                          loadFinancialData('COMPETENCIA');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          financeRegime === 'COMPETENCIA' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Regime de Competência (Fato Gerador)
                      </button>
                    </div>
                  </div>

                  {/* Estrutura Cascata da DRE */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    {/* 1. Receita Operacional Bruta */}
                    <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                            1. RECEITA OPERACIONAL BRUTA
                          </span>
                          <span className="text-xs text-emerald-700 mt-0.5 block">
                            Vendas de motocicletas no pátio e comissões bancárias
                          </span>
                        </div>
                        <span className="text-xl font-black text-emerald-900 font-mono">
                          + R$ {(financialDre?.receitaBruta?.total || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-emerald-200/80 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700">
                          <span>Vendas de Motos Realizadas:</span>
                          <b className="font-mono">R$ {(financialDre?.receitaBruta?.vendasMotos || 0).toLocaleString('pt-BR')}</b>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Retornos de Financiamento Bancário (Comissões):</span>
                          <b className="font-mono">R$ {(financialDre?.receitaBruta?.comissoesFinanciamento || 0).toLocaleString('pt-BR')}</b>
                        </div>
                      </div>
                    </div>

                    {/* 2. Deduções e Impostos */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                            2. (-) DEDUÇÕES DA RECEITA BRUTA & IMPOSTOS
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Simples Nacional / DAS e tributação incidente
                          </span>
                        </div>
                        <span className="text-lg font-black text-rose-600 font-mono">
                          - R$ {(financialDre?.deducoesImpostos || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* 3. Receita Líquida */}
                    <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-purple-900 block">
                          3. (=) RECEITA OPERACIONAL LÍQUIDA
                        </span>
                        <span className="text-[11px] text-purple-700">Base líquida gerencial para cálculo da margem</span>
                      </div>
                      <span className="text-2xl font-black text-purple-950 font-mono">
                        R$ {(financialDre?.receitaLiquida || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    {/* 4. CMV - Custo das Mercadorias Vendidas */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                            4. (-) CUSTO DAS MERCADORIAS VENDIDAS (CMV)
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Custo de aquisição das motos + preparação de oficina, peças e taxas Detran
                          </span>
                        </div>
                        <span className="text-lg font-black text-rose-600 font-mono">
                          - R$ {(financialDre?.cmv?.total || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700">
                          <span>Custo de Aquisição dos Veículos:</span>
                          <b className="font-mono">R$ {(financialDre?.cmv?.aquisicaoMotos || 0).toLocaleString('pt-BR')}</b>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Revisão de Oficina, Peças e Estética:</span>
                          <b className="font-mono">R$ {(financialDre?.cmv?.oficinaEstetica || 0).toLocaleString('pt-BR')}</b>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Despachante Detran & Laudos Cautelares:</span>
                          <b className="font-mono">R$ {(financialDre?.cmv?.despachanteDetran || 0).toLocaleString('pt-BR')}</b>
                        </div>
                      </div>
                    </div>

                    {/* 5. Lucro Bruto Operacional */}
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
                          5. (=) LUCRO BRUTO OPERACIONAL (Margem de Contribuição)
                        </span>
                        <span className="text-[11px] text-emerald-700">Receita Líquida deduzida dos custos diretos das motos</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-900 font-mono block">
                          R$ {(financialDre?.lucroBruto || 0).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          {financialDre?.margemBrutaPercentual || 0}% de margem bruta
                        </span>
                      </div>
                    </div>

                    {/* 6. Despesas Operacionais Fixas */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                            6. (-) DESPESAS OPERACIONAIS FIXAS & ADMINISTRATIVAS
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Estrutura do pavilhão, anúncios de portais e comissões da equipe
                          </span>
                        </div>
                        <span className="text-lg font-black text-rose-600 font-mono">
                          - R$ {(financialDre?.despesasOperacionais?.total || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-700">
                          <span>Aluguel do Showroom Florianópolis:</span>
                          <b className="font-mono">R$ {(financialDre?.despesasOperacionais?.aluguelShowroom || 0).toLocaleString('pt-BR')}</b>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Portais e Anúncios (Webmotors / OLX Pro):</span>
                          <b className="font-mono">R$ {(financialDre?.despesasOperacionais?.marketingAnuncios || 0).toLocaleString('pt-BR')}</b>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Comissões dos Vendedores:</span>
                          <b className="font-mono">R$ {(financialDre?.despesasOperacionais?.comissoesEquipe || 0).toLocaleString('pt-BR')}</b>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Energia, Água, Internet e Despesas Gerais:</span>
                          <b className="font-mono">R$ {(financialDre?.despesasOperacionais?.utilidadesGerais || 0).toLocaleString('pt-BR')}</b>
                        </div>
                      </div>
                    </div>

                    {/* 7 & 8. Lucro Líquido Final */}
                    <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-purple-300 block">
                          7. (=) RESULTADO LÍQUIDO FINAL DO PERÍODO
                        </span>
                        <p className="text-xs text-slate-300 mt-1">
                          Lucro gerencial disponível após pagamento de todos os custos e despesas operacionais.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black font-mono block text-emerald-400">
                          R$ {(financialDre?.lucroLiquido || 0).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs font-bold text-purple-200">
                          {financialDre?.margemLiquidaPercentual || 0}% Margem Líquida
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA 3: CONTAS BANCÁRIAS & CAIXAS */}
              {financeSubTab === 'contas' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {financialAccounts.map((acc) => (
                      <div key={acc.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                              {acc.type === 'CAIXA_FISICO' ? <Wallet className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                            </div>
                            <div>
                              <strong className="text-xs font-black text-slate-900 block">{acc.name}</strong>
                              <span className="text-[10px] text-slate-400 block">{acc.bankName || 'Conta Corrente'}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            Ativa
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo em Conta</span>
                          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                            R$ {acc.currentBalance.toLocaleString('pt-BR')}
                          </span>
                        </div>

                        {acc.accountNumber && (
                          <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg">
                            Ag: {acc.agency || '0001'} · CC: {acc.accountNumber}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 8: USUÁRIOS & EQUIPE (PRD 01)                        */}
          {/* ======================================================== */}
          {activeTab === 'equipe' && currentUser?.role === 'ADMIN' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5]">
                    Gestão de Acessos & RBAC (PRD 01)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Equipe e Níveis de Permissão
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controle quem pode acessar custos reais, fechar vendas ou gerenciar o sistema.
                  </p>
                </div>

                <button
                  onClick={() => setShowModalUser(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Novo Usuário
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3">Nome / Usuário</th>
                      <th className="pb-3">E-mail</th>
                      <th className="pb-3">Perfil de Acesso</th>
                      <th className="pb-3">Permissão de Custo</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {team.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 font-bold text-slate-900">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="ml-2 text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                              Você
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-500 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5">
                          {u.role === 'ADMIN' || u.role === 'FINANCEIRO' || u.role === 'GERENTE' ? (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Liberado (Vê Custo & Lucro)
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" /> Bloqueado (Apenas Preço Vitrine)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            Ativo
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleSwitchUser(u.id)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            Simular Perfil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 9: DOCUMENTOS, CONTRATOS & IMPRESSÕES (PRD 09)       */}
          {/* ======================================================== */}
          {activeTab === 'documentos' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5]">
                    Gestão Jurídica & Documental (PRD 09)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Documentos, Contratos & Impressões
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Emissão e impressão de contratos de compra e venda, certificados de garantia (90 dias CDC), recibos de sinal e termos de responsabilidade.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setGenDocType('CONTRATO_VENDA');
                    setGenDocSaleId('');
                    setGenDocMotoId(motos[0]?.id || '');
                    setGenDocBuyerName('');
                    setGenDocBuyerDoc('');
                    setGenDocBuyerPhone('');
                    setGenDocSalePrice(motos[0]?.publicPrice || 0);
                    setShowModalGenerateDoc(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Emitir Novo Documento
                </button>
              </div>

              {/* KPIs de Documentos */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Emitidos</span>
                  <strong className="text-2xl font-black text-slate-900 mt-1 block">
                    {documents.length}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-medium">Documentos no sistema</span>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 shadow-xs">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Contratos de Venda</span>
                  <strong className="text-2xl font-black text-blue-800 mt-1 block">
                    {documents.filter((d) => d.type === 'CONTRATO_VENDA').length}
                  </strong>
                  <span className="text-[10px] text-blue-600 font-medium">Com garantia legal CDC</span>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Termos de Garantia 90D</span>
                  <strong className="text-2xl font-black text-amber-800 mt-1 block">
                    {documents.filter((d) => d.type === 'TERMO_GARANTIA').length}
                  </strong>
                  <span className="text-[10px] text-amber-600 font-medium">Motor e câmbio</span>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Recibos de Sinal</span>
                  <strong className="text-2xl font-black text-emerald-800 mt-1 block">
                    {documents.filter((d) => d.type === 'RECIBO_SINAL').length}
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-medium">Reservas de motos</span>
                </div>

                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 shadow-xs col-span-2 md:col-span-1">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Assinados</span>
                  <strong className="text-2xl font-black text-purple-800 mt-1 block">
                    {documents.filter((d) => d.status === 'ASSINADO').length}
                  </strong>
                  <span className="text-[10px] text-purple-600 font-medium">Firmados pelas partes</span>
                </div>
              </div>

              {/* Filtros e Busca */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setDocFilterType('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      docFilterType === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos ({documents.length})
                  </button>
                  <button
                    onClick={() => setDocFilterType('CONTRATO_VENDA')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      docFilterType === 'CONTRATO_VENDA'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Contratos de Venda
                  </button>
                  <button
                    onClick={() => setDocFilterType('TERMO_GARANTIA')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      docFilterType === 'TERMO_GARANTIA'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Garantia 90D
                  </button>
                  <button
                    onClick={() => setDocFilterType('RECIBO_SINAL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      docFilterType === 'RECIBO_SINAL'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Recibos de Sinal
                  </button>
                  <button
                    onClick={() => setDocFilterType('TERMO_RESPONSABILIDADE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      docFilterType === 'TERMO_RESPONSABILIDADE'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    Multas & Infrações
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por moto, placa ou comprador..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-purple-500"
                  />
                </div>
              </div>

              {/* Tabela de Documentos */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3.5 px-4">Tipo & Título do Documento</th>
                        <th className="py-3.5 px-4">Motocicleta</th>
                        <th className="py-3.5 px-4">Comprador / Titular</th>
                        <th className="py-3.5 px-4">Data Emissão</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {documents
                        .filter((doc) => {
                          const matchesType = docFilterType === 'ALL' || doc.type === docFilterType;
                          const term = docSearch.toLowerCase();
                          const matchesSearch =
                            doc.title.toLowerCase().includes(term) ||
                            (doc.motorcycle?.model && doc.motorcycle.model.toLowerCase().includes(term)) ||
                            (doc.motorcycle?.plate && doc.motorcycle.plate.toLowerCase().includes(term)) ||
                            (doc.sale?.customer?.name && doc.sale.customer.name.toLowerCase().includes(term));
                          return matchesType && matchesSearch;
                        })
                        .map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                                    doc.type === 'CONTRATO_VENDA'
                                      ? 'bg-blue-100 text-blue-800'
                                      : doc.type === 'TERMO_GARANTIA'
                                      ? 'bg-amber-100 text-amber-800'
                                      : doc.type === 'RECIBO_SINAL'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {doc.type.replace('_', ' ')}
                                </span>
                                <strong className="text-slate-900 block truncate max-w-xs">{doc.title}</strong>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {doc.motorcycle ? (
                                <div>
                                  <span className="font-bold text-slate-900">
                                    {doc.motorcycle.brand} {doc.motorcycle.model}
                                  </span>
                                  <span className="block text-[10px] font-mono text-purple-700">
                                    {doc.motorcycle.plate}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {doc.sale?.customer ? (
                                <div>
                                  <b className="text-slate-900">{doc.sale.customer.name}</b>
                                  <span className="block text-[10px] text-slate-400">{doc.sale.customer.phone}</span>
                                </div>
                              ) : (
                                <span className="text-slate-500">Conforme preenchimento</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                              {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  doc.status === 'ASSINADO'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {doc.status === 'ASSINADO' ? '✓ Assinado' : 'Gerado'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenPrintDoc(doc)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-[11px] font-bold rounded-lg transition cursor-pointer shadow-xs"
                                  title="Abrir visualização pronta para impressão e PDF"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
                                </button>

                                {doc.status !== 'ASSINADO' && (
                                  <button
                                    onClick={() => handleMarkDocSigned(doc.id)}
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg transition cursor-pointer"
                                    title="Marcar como formalmente assinado pelas partes"
                                  >
                                    ✓ Firmado
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Excluir documento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 10: AUDITORIA, LOGS & SEGURANÇA (PRD 10)             */}
          {/* ======================================================== */}
          {activeTab === 'auditoria' && (currentUser?.role === 'ADMIN' || currentUser?.role === 'GERENTE') && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">
                    Trilha de Auditoria & Conformidade LGPD (PRD 10)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Auditoria, Logs & Segurança
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rastreabilidade completa de alterações de preços, movimentações de estoque, baixas financeiras, contratos e trocas de perfil.
                  </p>
                </div>

                <button
                  onClick={() => loadAuditLogs()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Repeat className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
                  Atualizar Trilha
                </button>
              </div>

              {/* KPIs de Auditoria */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Ações</span>
                  <strong className="text-2xl font-black text-slate-900 mt-1 block">
                    {auditMetrics?.total ?? auditLogs.length}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-medium">Eventos registrados</span>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Alterações de Preço</span>
                  <strong className="text-2xl font-black text-amber-800 mt-1 block">
                    {auditMetrics?.priceChanges ?? auditLogs.filter(l => l.action === 'PRICE_CHANGE').length}
                  </strong>
                  <span className="text-[10px] text-amber-600 font-medium">Ajustes de tabela & FIPE</span>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 shadow-xs">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Ações Financeiras</span>
                  <strong className="text-2xl font-black text-blue-800 mt-1 block">
                    {auditMetrics?.financialActions ?? auditLogs.filter(l => l.action.startsWith('FINANCIAL_')).length}
                  </strong>
                  <span className="text-[10px] text-blue-600 font-medium">Baixas, lançamentos & estornos</span>
                </div>

                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 shadow-xs">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Segurança & Acessos</span>
                  <strong className="text-2xl font-black text-rose-800 mt-1 block">
                    {auditMetrics?.securityEvents ?? auditLogs.filter(l => ['LOGIN', 'SWITCH_USER', 'ACCESS_SENSITIVE'].includes(l.action)).length}
                  </strong>
                  <span className="text-[10px] text-rose-600 font-medium">Troca de perfil e logins</span>
                </div>
              </div>

              {/* Filtros e Busca */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setAuditFilterAction('ALL');
                      loadAuditLogs('ALL', auditSearch);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      auditFilterAction === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => {
                      setAuditFilterAction('PRICE_CHANGE');
                      loadAuditLogs('PRICE_CHANGE', auditSearch);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      auditFilterAction === 'PRICE_CHANGE'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Preços
                  </button>
                  <button
                    onClick={() => {
                      setAuditFilterAction('STATUS_CHANGE');
                      loadAuditLogs('STATUS_CHANGE', auditSearch);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      auditFilterAction === 'STATUS_CHANGE'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    Estoque / Status
                  </button>
                  <button
                    onClick={() => {
                      setAuditFilterAction('FINANCIAL_BAIXA');
                      loadAuditLogs('FINANCIAL_BAIXA', auditSearch);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      auditFilterAction === 'FINANCIAL_BAIXA'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Baixas Financeiras
                  </button>
                  <button
                    onClick={() => {
                      setAuditFilterAction('SALE_CREATE');
                      loadAuditLogs('SALE_CREATE', auditSearch);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      auditFilterAction === 'SALE_CREATE'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Vendas
                  </button>
                  <button
                    onClick={() => {
                      setAuditFilterAction('SWITCH_USER');
                      loadAuditLogs('SWITCH_USER', auditSearch);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      auditFilterAction === 'SWITCH_USER'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    Troca de Perfil
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrar por ação, moto ou operador..."
                    value={auditSearch}
                    onChange={(e) => {
                      setAuditSearch(e.target.value);
                      loadAuditLogs(auditFilterAction, e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-purple-500"
                  />
                </div>
              </div>

              {/* Tabela de Trilha de Auditoria */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3.5 px-4">Data & Horário</th>
                        <th className="py-3.5 px-4">Operador / Usuário</th>
                        <th className="py-3.5 px-4">Ação & Entidade</th>
                        <th className="py-3.5 px-4">Detalhes da Modificação</th>
                        <th className="py-3.5 px-4 text-right">IP de Origem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {auditLogs.map((log) => {
                        const date = new Date(log.createdAt);
                        return (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              <span className="font-bold text-slate-800 block">
                                {date.toLocaleDateString('pt-BR')}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {date.toLocaleTimeString('pt-BR')}
                              </span>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              {log.user ? (
                                <div>
                                  <span className="font-bold text-slate-900 block">{log.user.name}</span>
                                  <span className="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-100">
                                    {log.user.role}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Sistema / Automático</span>
                              )}
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                                    log.action === 'PRICE_CHANGE'
                                      ? 'bg-amber-100 text-amber-900'
                                      : log.action === 'STATUS_CHANGE'
                                      ? 'bg-purple-100 text-purple-900'
                                      : log.action === 'SALE_CREATE'
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : log.action.startsWith('FINANCIAL_')
                                      ? 'bg-blue-100 text-blue-900'
                                      : log.action.startsWith('DOCUMENT_')
                                      ? 'bg-indigo-100 text-indigo-900'
                                      : log.action === 'SWITCH_USER'
                                      ? 'bg-rose-100 text-rose-900'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {log.action.replace('_', ' ')}
                                </span>
                                <span className="block text-[10px] font-mono text-slate-400">
                                  {log.entity}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-800 font-normal leading-relaxed max-w-md">
                              {log.details}
                            </td>

                            <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                              {log.ipAddress || '127.0.0.1'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 11: IA & AUTOMAÇÕES INTELIGENTES (PRD 10)            */}
          {/* ======================================================== */}
          {activeTab === 'ia' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#6d3df5] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Inteligência Operacional (PRD 10)
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    IA & Automações Inteligentes
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assistente seguro para redação de anúncios, análise de giro de estoque, resumo de negociações e vigilância de pendências.
                  </p>
                </div>

                <button
                  onClick={handleRunAutomations}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Executar Varredura de Alertas
                </button>
              </div>

              {/* Grid de Alertas Ativos */}
              {systemAlerts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Alertas Operacionais Ativos ({systemAlerts.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Varredura automática com base nas regras do PRD 10</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {systemAlerts.map((alt) => (
                      <div
                        key={alt.id}
                        className={`p-4 rounded-2xl border shadow-xs space-y-2 transition ${
                          alt.severity === 'CRITICAL'
                            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                            : 'bg-amber-50/70 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <strong className="text-xs font-bold">{alt.title}</strong>
                          <button
                            onClick={() => handleDismissAlert(alt.id)}
                            className="text-xs text-slate-400 hover:text-slate-800 p-0.5 cursor-pointer"
                            title="Dispensar alerta"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed">{alt.message}</p>
                        <div className="pt-2 flex items-center justify-between border-t border-slate-200/50 text-[10px]">
                          <span className="font-mono uppercase font-bold opacity-70">{alt.type}</span>
                          <span className="font-bold opacity-80">Há instantes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid 2 Colunas: Chat Operacional + Gerador de Anúncios */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Coluna Esquerda (7 cols): Chat Consultivo da Loja */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900">Chat com Assistente da Loja</h3>
                        <span className="text-[10px] text-slate-400 block">
                          Respostas determinísticas • RBAC ativo ({currentUser?.role})
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setAiChatMessages([
                          {
                            role: 'assistant',
                            content: 'Histórico limpo. Como posso ajudar agora?',
                          },
                        ])
                      }
                      className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      Limpar Chat
                    </button>
                  </div>

                  {/* Sugestões Rápidas de Prompt */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleSendAiChatMessage('Quais motos estão disponíveis para venda?')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition cursor-pointer"
                    >
                      🏍️ Motos disponíveis
                    </button>
                    <button
                      onClick={() => handleSendAiChatMessage('Quais motos estão paradas há mais de 30 dias?')}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold transition cursor-pointer"
                    >
                      ⏱️ Estoque parado &gt; 30d
                    </button>
                    <button
                      onClick={() => handleSendAiChatMessage('Qual a margem média de lucro das vendas?')}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold transition cursor-pointer"
                    >
                      📊 Margem de lucro (RBAC)
                    </button>
                  </div>

                  {/* Feed de Mensagens */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {aiChatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2.5 text-xs ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-lg bg-[#6d3df5] text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                            ⚡
                          </div>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl max-w-lg leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-[#6d3df5] text-white rounded-br-none'
                              : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex items-center gap-2 text-xs text-purple-600 font-bold p-2 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Processando resposta com regras do sistema...</span>
                      </div>
                    )}
                  </div>

                  {/* Input do Chat */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAiChatMessage();
                    }}
                    className="flex items-center gap-2 pt-2 border-t border-slate-100"
                  >
                    <input
                      type="text"
                      placeholder="Faça uma pergunta sobre o estoque, giro ou clientes..."
                      value={aiInputText}
                      onChange={(e) => setAiInputText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !aiInputText.trim()}
                      className="px-4 py-2 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* Coluna Direita (5 cols): Gerador Rápido de Anúncios Comercial */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900">Gerador de Anúncios (Fatos Reais)</h3>
                      <span className="text-[10px] text-slate-400 block">
                        Criação persuasiva sem inventar atributos (PRD 10)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Selecione uma moto do estoque para gerar um anúncio comercial pronto para vitrine, Webmotors, OLX ou Instagram:
                  </p>

                  <div className="space-y-3">
                    <select
                      onChange={(e) => {
                        const m = motos.find((moto) => moto.id === e.target.value);
                        if (m) handleGenerateListingAi(m);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                    >
                      <option value="">Selecione uma moto para gerar anúncio...</option>
                      {motos.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.brand} {m.model} ({m.plate}) - R$ {m.publicPrice.toLocaleString('pt-BR')}
                        </option>
                      ))}
                    </select>

                    {generatedListing && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs animate-fade-in">
                        <div>
                          <strong className="text-slate-900 block font-bold text-sm">
                            {generatedListing.headline}
                          </strong>
                        </div>

                        <ul className="space-y-1 text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 text-[11px]">
                          {generatedListing.bullets.map((b: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-purple-600 font-bold">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>

                        <p className="text-slate-700 whitespace-pre-line text-[11px] leading-relaxed">
                          {generatedListing.body}
                        </p>

                        <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-900 text-[11px] whitespace-pre-line">
                          {generatedListing.cta}
                        </div>

                        <button
                          onClick={() => {
                            const fullText = `${generatedListing.headline}\n\n${generatedListing.bullets.join('\n')}\n\n${generatedListing.body}\n\n${generatedListing.cta}`;
                            navigator.clipboard.writeText(fullText);
                            showToast('Texto do anúncio copiado para a área de transferência!');
                          }}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          📋 Copiar Anúncio Completo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portais' && (
            <PortalsTab motos={motos} showToast={showToast} />
          )}

          {activeTab === 'fiscal' && (
            <FiscalRenaveTab motos={motos} people={people} showToast={showToast} />
          )}

          {activeTab === 'servicos' && (
            <ServicesWarrantyTab motos={motos} people={people} showToast={showToast} />
          )}

          {activeTab === 'importacao' && (
            <DataImportTab onSuccess={() => { loadData(); }} showToast={showToast} />
          )}

          {activeTab === 'operacao' && (
            <SystemHealthTab showToast={showToast} />
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAIS DO SISTEMA                                        */}
      {/* ======================================================== */}

      {/* Modal 1: Cadastrar Nova Moto (PRD 03) */}
      {showModalMoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Bike className="w-5 h-5 text-purple-600" /> Cadastrar Moto no Estoque (PRD 03)
                </h3>
                <p className="text-xs text-slate-400">
                  Dados técnicos completos, FIPE, origem/fornecedor e custo de aquisição
                </p>
              </div>
              <button
                onClick={() => setShowModalMoto(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMoto} className="space-y-4">
              {/* Seletor FIPE Inteligente */}
              <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Preenchimento Automático via Tabela FIPE Oficial
                  </span>
                  {fipeLoading && <span className="text-[10px] text-purple-600 animate-pulse font-bold">Consultando API FIPE...</span>}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">1. Marca na FIPE</label>
                    <select
                      value={selectedFipeBrand}
                      onFocus={loadFipeBrands}
                      onChange={(e) => handleSelectFipeBrand(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold bg-white"
                    >
                      <option value="">Selecione a marca...</option>
                      {fipeBrands.map((b) => (
                        <option key={b.codigo} value={b.codigo}>{b.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">2. Modelo FIPE</label>
                    <select
                      value={selectedFipeModel}
                      disabled={!selectedFipeBrand}
                      onChange={(e) => handleSelectFipeModel(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs font-medium bg-white disabled:bg-slate-100"
                    >
                      <option value="">Selecione o modelo...</option>
                      {fipeModels.map((m) => (
                        <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">3. Ano / Versão FIPE</label>
                    <select
                      value={selectedFipeYear}
                      disabled={!selectedFipeModel}
                      onChange={(e) => handleSelectFipeYear(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs font-medium bg-white disabled:bg-slate-100"
                    >
                      <option value="">Selecione o ano...</option>
                      {fipeYears.map((y) => (
                        <option key={y.codigo} value={y.codigo}>{y.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {fipeResult && (
                  <div className="flex items-center justify-between text-xs pt-1.5 text-purple-950 font-bold border-t border-purple-200">
                    <span>Cotação Oficial: <b>{fipeResult.Valor}</b> ({fipeResult.MesReferencia})</span>
                    <span className="text-[10px] bg-purple-200/80 px-2 py-0.5 rounded font-mono font-bold">
                      Cód. FIPE: {fipeResult.CodigoFipe}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marca *</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="BMW">BMW</option>
                    <option value="Honda">Honda</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="Kawasaki">Kawasaki</option>
                    <option value="Triumph">Triumph</option>
                    <option value="Ducati">Ducati</option>
                    <option value="Harley-Davidson">Harley-Davidson</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Royal Enfield">Royal Enfield</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MT-07, Tiger 900..."
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Versão</label>
                  <input
                    type="text"
                    placeholder="Ex: ABS / Rally Pro"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    placeholder="BRA2E19"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cilindrada (cc)</label>
                  <input
                    type="number"
                    value={newDisplacement}
                    onChange={(e) => setNewDisplacement(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ano Fab.</label>
                  <input
                    type="number"
                    value={newYearMfg}
                    onChange={(e) => setNewYearMfg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ano Mod.</label>
                  <input
                    type="number"
                    value={newYearModel}
                    onChange={(e) => setNewYearModel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cor</label>
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Km Rodados</label>
                  <input
                    type="number"
                    value={newMileage}
                    onChange={(e) => setNewMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Propriedade</label>
                  <select
                    value={newOwnership}
                    onChange={(e) => setNewOwnership(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="PROPRIA">Própria da Loja</option>
                    <option value="CONSIGNADA">Consignação de Cliente</option>
                    <option value="TERCEIRO">Repasse / Terceiro</option>
                  </select>
                </div>
              </div>

              {/* Fornecedor e FIPE */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-purple-700 block">FIPE e Origem / Entrada</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Valor FIPE (R$)</label>
                    <input
                      type="number"
                      value={newFipeValue}
                      onChange={(e) => setNewFipeValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Cód. FIPE</label>
                    <input
                      type="text"
                      placeholder="005399-6"
                      value={newFipeCode}
                      onChange={(e) => setNewFipeCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Origem / Fornecedor</label>
                    <select
                      value={newSupplierId}
                      onChange={(e) => setNewSupplierId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                    >
                      <option value="">Selecione ou deixe em branco</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.tradeName || p.name} ({p.roles})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Custo de Aquisição (R$) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newAcqCost}
                      onChange={(e) => setNewAcqCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Preço de Venda Sugerido (R$) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newPublicPrice}
                      onChange={(e) => setNewPublicPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white text-purple-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalMoto(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingMoto}
                  className="px-5 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  {savingMoto ? 'Cadastrando...' : 'Cadastrar Moto no Estoque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adicionar Custo / Despesa (PRD 04) */}
      {showModalCost && selectedMoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Lançar Custo na Moto
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedMoto.brand} {selectedMoto.model} ({selectedMoto.plate})
                </p>
              </div>
              <button
                onClick={() => setShowModalCost(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoria de Custo *</label>
                <select
                  value={costCategory}
                  onChange={(e) => setCostCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-purple-700"
                >
                  <option value="OFICINA_MECANICA">Oficina / Mecânica</option>
                  <option value="PECAS">Peças e Componentes</option>
                  <option value="ESTETICA">Estética / Polimento / Lavagem</option>
                  <option value="DOCUMENTACAO">Documentação / Despachante Detran</option>
                  <option value="TRANSPORTE">Transporte / Frete / Guincho</option>
                  <option value="OUTROS">Outros Custos Operacionais</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de pastilhas de freio e óleo Motul"
                  value={costDescription}
                  onChange={(e) => setCostDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costAmount}
                    onChange={(e) => setCostAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fornecedor / Oficina Parceira</label>
                  <select
                    value={costSupplierId}
                    onChange={(e) => setCostSupplierId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="">Selecione parceiro cadastrado</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.tradeName || p.name} ({p.roles})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkCredit"
                  checked={costIsCredit}
                  onChange={(e) => setCostIsCredit(e.target.checked)}
                  className="rounded text-purple-600 cursor-pointer"
                />
                <label htmlFor="chkCredit" className="text-xs text-slate-700 cursor-pointer font-medium">
                  É um <b>crédito/estorno</b> (deduz do custo real da moto)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalCost(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCost}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  {savingCost ? 'Salvando...' : 'Lançar no Custo da Moto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Adicionar Pendência / OS (PRD 04) */}
      {showModalTask && selectedMoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-600" /> Nova Pendência / OS de Preparação
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedMoto.brand} {selectedMoto.model} ({selectedMoto.plate})
                </p>
              </div>
              <button
                onClick={() => setShowModalTask(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Pendência *</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-purple-700"
                  >
                    <option value="REVISAO_MECANICA">Revisão Mecânica Geral</option>
                    <option value="TROCA_OLEO">Troca de Óleo e Filtros</option>
                    <option value="PNEUS">Pneus / Relação</option>
                    <option value="ESTETICA">Estética / Polimento</option>
                    <option value="DOCUMENTAL">Laudo Cautelar / Detran</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioridade *</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título da Tarefa / OS *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Revisão preventiva de 20.000 km e troca de vela"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detalhes e Instruções</label>
                <textarea
                  rows={2}
                  placeholder="Instruções para o mecânico ou despachante..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Oficina / Parceiro</label>
                  <select
                    value={taskPartnerId}
                    onChange={(e) => setTaskPartnerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="">Selecione oficina/despachante</option>
                    {people
                      .filter((p) => p.roles.includes('OFICINA') || p.roles.includes('DESPACHANTE') || p.roles.includes('PARCEIRO'))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.tradeName || p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Limite / Prazo</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalTask(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="px-5 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  {savingTask ? 'Criando...' : 'Adicionar Pendência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Alterar Situação da Moto (PRD 03) */}
      {showModalStatusChange && selectedMoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900">Transição de Situação (PRD 03)</h3>
                <p className="text-xs text-slate-400">
                  Registra no histórico imutável a mudança e a justificativa
                </p>
              </div>
              <button
                onClick={() => setShowModalStatusChange(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStatusChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nova Situação *</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-purple-700"
                >
                  <option value="DISPONIVEL">Disponível para Venda</option>
                  <option value="EM_PREPARACAO">Em Preparação (Oficina/Estética)</option>
                  <option value="RESERVADA">Reservada (Com sinal pago)</option>
                  <option value="VENDIDA">Vendida</option>
                  <option value="ARQUIVADA">Arquivada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Justificativa / Motivo</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Moto revisada e liberada da oficina parceira..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalStatusChange(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-5 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  {savingStatus ? 'Gravando...' : 'Confirmar Mudança'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Modal Nova Pessoa (PRD 02) */}
      {showModalPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Contact className="w-5 h-5 text-purple-600" /> Cadastrar Pessoa ou Parceiro
                </h3>
                <p className="text-xs text-slate-400">
                  Cadastro com detecção de duplicidade por CPF/CNPJ e múltiplos papéis
                </p>
              </div>
              <button
                onClick={() => setShowModalPerson(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Pessoa *</label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="PF">Pessoa Física (PF - CPF)</option>
                    <option value="PJ">Pessoa Jurídica (PJ - CNPJ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Papel Principal *</label>
                  <select
                    value={pRoles}
                    onChange={(e) => setPRoles(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-purple-700"
                  >
                    <option value="CLIENTE">Cliente / Comprador</option>
                    <option value="FORNECEDOR">Fornecedor de Motos</option>
                    <option value="OFICINA,PARCEIRO">Oficina Mecânica / Preparação</option>
                    <option value="DESPACHANTE,PARCEIRO">Despachante Detran</option>
                    <option value="FORNECEDOR,CLIENTE">Cliente & Fornecedor (Misto)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {pType === 'PF' ? 'Nome Completo *' : 'Razão Social *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={pType === 'PF' ? 'Ex: Carlos Silva' : 'Ex: Auto Peças e Mecânica Silva Ltda'}
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {pType === 'PJ' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    placeholder="Ex: MotoSilva"
                    value={pTradeName}
                    onChange={(e) => setPTradeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {pType === 'PF' ? 'CPF' : 'CNPJ'}
                  </label>
                  <input
                    type="text"
                    placeholder={pType === 'PF' ? '000.000.000-00' : '00.000.000/0001-00'}
                    value={pDoc}
                    onChange={(e) => setPDoc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(48) 99999-9999"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalPerson(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPerson}
                  className="px-5 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  {savingPerson ? 'Salvando...' : 'Salvar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Concretizar Venda */}
      {showModalSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <HandCoins className="w-5 h-5 text-emerald-600" /> Concretizar Venda / Fechar Negócio
                </h3>
                <p className="text-xs text-slate-400">
                  Baixa automática de estoque, apuração de margem e lançamento no financeiro
                </p>
              </div>
              <button
                onClick={() => setShowModalSale(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSale} className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  1. Moto a ser Vendida *
                </label>
                <select
                  value={saleMotoId}
                  onChange={(e) => {
                    setSaleMotoId(e.target.value);
                    const found = motos.find((m) => m.id === e.target.value);
                    if (found) setSalePrice(found.publicPrice);
                  }}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  {motos
                    .filter((m) => m.status !== 'VENDIDA')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.brand} {m.model} ({m.plate}) — Preço sugerido: R$ {m.publicPrice.toLocaleString('pt-BR')}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  2. Dados do Comprador *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Nome Completo do Cliente *"
                      value={saleCustName}
                      onChange={(e) => setSaleCustName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="CPF / CNPJ"
                      value={saleCustDoc}
                      onChange={(e) => setSaleCustDoc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Telefone / WhatsApp com DDD *"
                    value={saleCustPhone}
                    onChange={(e) => setSaleCustPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  3. Condições de Pagamento *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Preço Final Acordado (R$) *</span>
                    <input
                      type="number"
                      required
                      value={salePrice}
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Modalidade da Venda</span>
                    <select
                      value={salePaymentType}
                      onChange={(e) => setSalePaymentType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      <option value="A_VISTA">À Vista / PIX / TED</option>
                      <option value="FINANCIAMENTO">Financiamento Bancário</option>
                      <option value="TROCA">Venda com Moto na Troca</option>
                    </select>
                  </div>
                </div>

                {salePaymentType === 'TROCA' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Repeat className="w-4 h-4 text-amber-700" /> Moto dada na Troca (Entrada Automática no Pátio)
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Placa da Troca *"
                          value={saleTradePlate}
                          onChange={(e) => setSaleTradePlate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-mono font-bold uppercase bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Modelo (ex: Yamaha Fazer 250) *"
                          value={saleTradeModel}
                          onChange={(e) => setSaleTradeModel(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-medium bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-amber-800 block mb-1 font-semibold">
                          Valor Avaliado na Troca (R$)
                        </span>
                        <input
                          type="number"
                          required
                          value={saleTradeAmount}
                          onChange={(e) => setSaleTradeAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-mono font-bold bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-800 block mb-1 font-semibold">
                          Saldo Restante a Receber (R$)
                        </span>
                        <div className="px-3 py-2 bg-amber-100 rounded-xl text-xs font-mono font-black text-amber-950">
                          R$ {(salePrice - saleTradeAmount).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalSale(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingSale}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  {submittingSale ? 'Processando Venda...' : 'Finalizar Venda & Baixar Estoque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 7: Contrato de Compra e Venda */}
      {selectedContractSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Contrato & Recibo de Compra e Venda
                  </h3>
                  <span className="text-xs text-slate-400">Documento Oficial · PRD 09</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
                </button>
                <button
                  onClick={() => setSelectedContractSale(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-6 text-xs text-slate-700 leading-relaxed font-serif p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-center pb-4 border-b border-slate-200">
                <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 font-sans">
                  The Rock Moto Shop
                </h2>
                <p className="text-[11px] text-slate-500 font-sans">
                  Florianópolis · Santa Catarina · CNPJ: 12.345.678/0001-90
                </p>
                <div className="text-[10px] text-purple-700 font-mono font-bold mt-1">
                  TERMO DE COMPRA E VENDA Nº MF-{selectedContractSale.id.slice(0, 8).toUpperCase()}
                </div>
              </div>

              <div>
                <strong className="block text-slate-900 font-sans mb-1 uppercase text-[11px]">1. Das Partes</strong>
                <p>
                  <b>Vendedora:</b> The Rock Moto Shop, inscrita no CNPJ sob o nº 12.345.678/0001-90, com sede em Florianópolis/SC.<br />
                  <b>Comprador(a):</b> {selectedContractSale.customer.name}, CPF/CNPJ: {selectedContractSale.customer.document || 'Constante no cadastro'}, Telefone: {selectedContractSale.customer.phone}.
                </p>
              </div>

              <div>
                <strong className="block text-slate-900 font-sans mb-1 uppercase text-[11px]">2. Do Objeto</strong>
                <p>
                  Constitui objeto deste instrumento a compra e venda da motocicleta marca <b>{selectedContractSale.motorcycle.brand}</b>, modelo <b>{selectedContractSale.motorcycle.model}</b>, placa <b>{selectedContractSale.motorcycle.plate}</b>, ano {selectedContractSale.motorcycle.yearMfg}/{selectedContractSale.motorcycle.yearModel}, cor {selectedContractSale.motorcycle.color}, vistoriada e aprovada pelo comprador.
                </p>
              </div>

              <div>
                <strong className="block text-slate-900 font-sans mb-1 uppercase text-[11px]">3. Do Preço e Condições</strong>
                <p>
                  O valor total acordado para esta transação é de <b>R$ {selectedContractSale.salePrice.toLocaleString('pt-BR')}</b>, liquidado na modalidade <b>{selectedContractSale.paymentType}</b>.
                </p>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 text-center font-sans text-[11px]">
                <div className="border-t border-slate-400 pt-2">
                  <b>The Rock Moto Shop</b><br />
                  <span className="text-slate-500">Vendedora</span>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <b>{selectedContractSale.customer.name}</b><br />
                  <span className="text-slate-500">Comprador(a)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 8: Novo Usuário (PRD 01) */}
      {showModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Cadastrar Novo Membro</h3>
                <p className="text-xs text-slate-400">Defina o nome, e-mail e papel de acesso</p>
              </div>
              <button
                onClick={() => setShowModalUser(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Profissional *</label>
                <input
                  type="email"
                  required
                  placeholder="joao@therockmotos.com.br"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Perfil / Papel *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <option value="VENDEDOR">Vendedor (Sem acesso a custos e margens)</option>
                  <option value="GERENTE">Gerente Comercial (Acesso a custos e vendas)</option>
                  <option value="FINANCEIRO">Financeiro (Acesso a contas e DRE)</option>
                  <option value="ESTOQUE">Estoque (Pátio e preparação)</option>
                  <option value="ADMIN">Administrador Geral (Acesso irrestrito)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalUser(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  Cadastrar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 9: Consulta FIPE Dedicada (PRD 03) */}
      {showModalFipeQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Consulta Oficial Tabela FIPE
                </h3>
                <p className="text-xs text-slate-400">
                  {fipeTargetMoto
                    ? `Atualizando cotação de ${fipeTargetMoto.brand} ${fipeTargetMoto.model} (${fipeTargetMoto.plate})`
                    : 'Consulte valores oficiais de qualquer moto no Brasil'}
                </p>
              </div>
              <button
                onClick={() => setShowModalFipeQuery(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1. Marca da Moto *</label>
                <select
                  value={selectedFipeBrand}
                  onChange={(e) => handleSelectFipeBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="">Selecione a marca...</option>
                  {fipeBrands.map((b) => (
                    <option key={b.codigo} value={b.codigo}>{b.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">2. Modelo *</label>
                <select
                  value={selectedFipeModel}
                  disabled={!selectedFipeBrand}
                  onChange={(e) => handleSelectFipeModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white disabled:bg-slate-100"
                >
                  <option value="">Selecione o modelo...</option>
                  {fipeModels.map((m) => (
                    <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">3. Ano Modelo & Combustível *</label>
                <select
                  value={selectedFipeYear}
                  disabled={!selectedFipeModel}
                  onChange={(e) => handleSelectFipeYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white disabled:bg-slate-100"
                >
                  <option value="">Selecione o ano...</option>
                  {fipeYears.map((y) => (
                    <option key={y.codigo} value={y.codigo}>{y.nome}</option>
                  ))}
                </select>
              </div>

              {fipeLoading && (
                <div className="p-3 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl text-center animate-pulse">
                  Consultando base de dados FIPE em tempo real...
                </div>
              )}

              {fipeResult && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-purple-600 block tracking-wider">
                    Resultado da Consulta FIPE
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {fipeResult.Valor}
                    </span>
                    <span className="text-xs font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                      Ref: {fipeResult.MesReferencia}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-purple-200">
                    <div>Modelo: <b>{fipeResult.Modelo}</b></div>
                    <div>Código FIPE: <b className="font-mono">{fipeResult.CodigoFipe}</b></div>
                    <div>Combustível: <b>{fipeResult.Combustivel}</b></div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalFipeQuery(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Fechar
                </button>
                {fipeTargetMoto && fipeResult && (
                  <button
                    type="button"
                    onClick={handleApplyFipeToCurrentMoto}
                    className="px-5 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                  >
                    Atualizar Moto com esta Cotação
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 10: Novo Título / Despesa / Receita (PRD 07) */}
      {showModalFinanceEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-purple-600" /> Novo Lançamento Financeiro
                </h3>
                <p className="text-xs text-slate-400">Contas a pagar ou a receber com centro de custo</p>
              </div>
              <button
                onClick={() => setShowModalFinanceEntry(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFinancialEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Movimento *</label>
                  <select
                    value={fEntryType}
                    onChange={(e) => setFEntryType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="DESPESA">Conta a Pagar (Saída / Despesa)</option>
                    <option value="RECEITA">Conta a Receber (Entrada / Receita)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria Contábil *</label>
                  <select
                    value={fEntryCategory}
                    onChange={(e) => setFEntryCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-purple-700"
                  >
                    <option value="ALUGUEL">Aluguel Showroom</option>
                    <option value="MARKETING_ANUNCIOS">Marketing & Portais (Webmotors/OLX)</option>
                    <option value="COMISSAO">Comissão de Vendedor</option>
                    <option value="IMPOSTOS">Impostos (Simples Nacional / DAS)</option>
                    <option value="OFICINA_MECANICA">Oficina / Mecânica de Preparação</option>
                    <option value="PECAS">Peças de Reposição</option>
                    <option value="DOCUMENTACAO">Despachante & Detran</option>
                    <option value="DESPESA_OPERACIONAL">Energia, Água & Geral</option>
                    <option value="VENDA_MOTO">Recebimento de Venda</option>
                    <option value="COMISSAO_FINANCIAMENTO">Retorno de Financiamento</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição do Título *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mensalidade Webmotors Revenda Pro"
                  value={fEntryDesc}
                  onChange={(e) => setFEntryDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Previsto (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fEntryAmount}
                    onChange={(e) => setFEntryAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={fEntryDueDate}
                    onChange={(e) => setFEntryDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Centro de Custo</label>
                  <select
                    value={fEntryCostCenter}
                    onChange={(e) => setFEntryCostCenter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="SHOWROOM">Showroom Principal</option>
                    <option value="OFICINA">Oficina / Pátio</option>
                    <option value="COMERCIAL">Comercial / Vendas</option>
                    <option value="ADMINISTRATIVO">Administrativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Forma Prevista</label>
                  <select
                    value={fEntryMethod}
                    onChange={(e) => setFEntryMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto Bancário</option>
                    <option value="TED">TED / Transferência</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    <option value="DINHEIRO">Dinheiro / Espécie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Conta Financeira</label>
                  <select
                    value={fEntryAccountId}
                    onChange={(e) => setFEntryAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="">Selecione conta...</option>
                    {financialAccounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pessoa / Fornecedor</label>
                  <select
                    value={fEntryCustomerId}
                    onChange={(e) => setFEntryCustomerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="">Nenhum / Não vinculado</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.tradeName || p.name} ({p.roles})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Veículo Vinculado</label>
                  <select
                    value={fEntryMotoId}
                    onChange={(e) => setFEntryMotoId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="">Nenhum / Custo geral</option>
                    {motos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.brand} {m.model} ({m.plate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalFinanceEntry(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingFEntry}
                  className="px-5 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  {savingFEntry ? 'Salvando...' : 'Lançar Título'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 11: Baixa de Título / Liquidação (PRD 07) */}
      {showModalBaixa && baixaEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {baixaEntry.type === 'RECEITA' ? 'Receber Título' : 'Pagar Título'}
                </h3>
                <p className="text-xs text-slate-400">
                  Liquidação e conciliação bancária atômica
                </p>
              </div>
              <button
                onClick={() => setShowModalBaixa(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteBaixa} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Título a Liquidar</span>
                <strong className="text-sm text-slate-900 block mt-0.5">{baixaEntry.description}</strong>
                <span className="text-slate-500 block mt-1">
                  Vencimento original: <b>{new Date(baixaEntry.dueDate).toLocaleDateString('pt-BR')}</b>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Conta Bancária de {baixaEntry.type === 'RECEITA' ? 'Entrada' : 'Saída'} *
                </label>
                <select
                  required
                  value={baixaAccountId}
                  onChange={(e) => setBaixaAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-purple-700"
                >
                  <option value="">Selecione a conta...</option>
                  {financialAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Saldo atual: R$ {a.currentBalance.toLocaleString('pt-BR')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Liquidado (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={baixaPaidAmount}
                    onChange={(e) => setBaixaPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Efetiva *</label>
                  <input
                    type="date"
                    required
                    value={baixaDate}
                    onChange={(e) => setBaixaDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalBaixa(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingBaixa}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  {savingBaixa ? 'Baixando...' : 'Confirmar e Atualizar Saldo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: FICHA E HISTÓRICO COMPLETO DO LEAD (PRD 08)     */}
      {/* ======================================================== */}
      {showModalCrmDetail && selectedCrmLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6d3df5]">
                  Ficha do Lead & Histórico de Atendimento
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedCrmLead.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>📞 {selectedCrmLead.phone}</span>
                  {selectedCrmLead.email && <span>• ✉️ {selectedCrmLead.email}</span>}
                  <span>• Origem: <b>{selectedCrmLead.source.replace('_', ' ')}</b></span>
                </div>
              </div>
              <button
                onClick={() => setShowModalCrmDetail(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Informações de Interesse e Negociação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Moto de Interesse</span>
                {selectedCrmLead.motorcycle ? (
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    🏍️ {selectedCrmLead.motorcycle.brand} {selectedCrmLead.motorcycle.model} ({selectedCrmLead.motorcycle.plate})
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5">Nenhuma moto específica vinculada</p>
                )}
                {selectedCrmLead.motorcycle?.publicPrice && (
                  <span className="text-[11px] font-bold text-purple-700 block mt-0.5">
                    Preço de Tabela: R$ {selectedCrmLead.motorcycle.publicPrice.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Estágio & Orçamento</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    {selectedCrmLead.stage}
                  </span>
                  {selectedCrmLead.budget && (
                    <span className="text-xs font-bold text-emerald-700">
                      Orç.: R$ {selectedCrmLead.budget.toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Vendedor: <b>{selectedCrmLead.assignedTo?.name || 'Não atribuído'}</b>
                </span>
              </div>
            </div>

            {/* Resumo e Análise com IA (PRD 10) */}
            <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Diagnóstico & Temperatura de Compra (IA)
                </span>
                <button
                  type="button"
                  onClick={() => handleSummarizeLeadAi(selectedCrmLead)}
                  className="px-2.5 py-1 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-[10px] font-bold rounded-lg transition cursor-pointer shadow-xs"
                >
                  {leadAiSummary ? 'Reanalisar com IA' : '✨ Analisar Histórico com IA'}
                </button>
              </div>

              {leadAiSummary ? (
                <div className="space-y-1.5 text-xs text-purple-950">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[11px]">Temperatura de Compra:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        leadAiSummary.buyingTemperature === 'QUENTE'
                          ? 'bg-rose-100 text-rose-800'
                          : leadAiSummary.buyingTemperature === 'MORNO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {leadAiSummary.buyingTemperature}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[11px]">Ação Comercial Recomendada pela IA:</span>
                    <p className="text-[11px] text-purple-900 mt-0.5 bg-white p-2 rounded-lg border border-purple-200">
                      💡 {leadAiSummary.suggestedAction}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-purple-700/80 italic">
                  Clique em &quot;Analisar Histórico com IA&quot; para sintetizar as interações e receber sugestões de fechamento.
                </p>
              )}
            </div>

            {/* Ações Rápidas de WhatsApp com Templates do PRD 08 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" /> Modelos Rápidos de WhatsApp:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={buildWhatsAppUrl(selectedCrmLead.phone, getWhatsAppTemplate(selectedCrmLead, 'primeiro_contato'))}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition text-[11px] font-bold flex flex-col justify-between gap-1"
                >
                  <span className="flex items-center gap-1">👋 1º Contato</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Apresentação e fotos</span>
                </a>

                <a
                  href={buildWhatsAppUrl(selectedCrmLead.phone, getWhatsAppTemplate(selectedCrmLead, 'test_ride'))}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 transition text-[11px] font-bold flex flex-col justify-between gap-1"
                >
                  <span className="flex items-center gap-1">🏍️ Convite Test-Ride</span>
                  <span className="text-[10px] text-blue-600 font-normal">Visita ao Showroom</span>
                </a>

                <a
                  href={buildWhatsAppUrl(selectedCrmLead.phone, getWhatsAppTemplate(selectedCrmLead, 'financiamento'))}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 transition text-[11px] font-bold flex flex-col justify-between gap-1"
                >
                  <span className="flex items-center gap-1">💳 Financiamento</span>
                  <span className="text-[10px] text-purple-600 font-normal">Simulação de parcelas</span>
                </a>
              </div>
            </div>

            {/* Registrar Nova Interação */}
            <form onSubmit={handleAddInteraction} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Registrar Interação / Anotação Comercial:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newInteractionType}
                  onChange={(e) => setNewInteractionType(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="WHATSAPP">💬 WhatsApp</option>
                  <option value="LIGACAO">📞 Ligação Telefônica</option>
                  <option value="VISITA_SHOWROOM">🏬 Visita Showroom</option>
                  <option value="TEST_RIDE">🏍️ Test-Ride Realizado</option>
                  <option value="PROPOSTA">📄 Proposta Enviada</option>
                  <option value="ANOTACOES">📝 Anotação Interna</option>
                </select>

                <input
                  type="text"
                  required
                  placeholder="Resumo da conversa ou próximo compromisso..."
                  value={newInteractionDesc}
                  onChange={(e) => setNewInteractionDesc(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingInteraction || !newInteractionDesc}
                  className="px-4 py-1.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {savingInteraction ? 'Salvando...' : 'Gravar no Histórico'}
                </button>
              </div>
            </form>

            {/* Linha do Tempo / Timeline de Interações */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                Histórico de Contatos ({selectedCrmLead.interactions?.length || 0})
              </span>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {selectedCrmLead.interactions && selectedCrmLead.interactions.length > 0 ? (
                  selectedCrmLead.interactions.map((it) => (
                    <div key={it.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[9px] text-[#6d3df5]">
                            {it.type}
                          </span>
                          {it.authorName || 'Equipe Comercial'}
                        </span>
                        <span>{new Date(it.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{it.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    Nenhuma interação manual registrada ainda.
                  </p>
                )}
              </div>
            </div>

            {/* Rodapé com Mudança de Estágio e Conversão */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Mudar para:</span>
                <button
                  onClick={() => handleUpdateLeadStage(selectedCrmLead.id, 'CONTATO')}
                  className="px-2 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg cursor-pointer"
                >
                  Contato
                </button>
                <button
                  onClick={() => handleUpdateLeadStage(selectedCrmLead.id, 'VISITA_AGENDADA')}
                  className="px-2 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg cursor-pointer"
                >
                  Visita
                </button>
                <button
                  onClick={() => handleUpdateLeadStage(selectedCrmLead.id, 'PROPOSTA')}
                  className="px-2 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg cursor-pointer"
                >
                  Proposta
                </button>
                <button
                  onClick={() => handleUpdateLeadStage(selectedCrmLead.id, 'PERDIDO')}
                  className="px-2 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer"
                >
                  Perdido
                </button>
              </div>

              <button
                onClick={() => {
                  setShowModalCrmDetail(false);
                  handleConvertLeadToSale(selectedCrmLead);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                🎉 Converter Lead em Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CADASTRO MANUAL DE NOVO LEAD (PRD 08)           */}
      {/* ======================================================== */}
      {showModalNewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6d3df5]">
                  Captação Manual (PRD 08)
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Novo Lead / Oportunidade
                </h3>
              </div>
              <button
                onClick={() => setShowModalNewLead(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Mendes"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(48) 99999-9999"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail (opcional)</label>
                  <input
                    type="email"
                    placeholder="carlos@email.com"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origem do Contato</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="BALCAO_PRESENCIAL">🏬 Balcão / Loja Física</option>
                    <option value="WHATSAPP">💬 WhatsApp Direto</option>
                    <option value="VITRINE_SITE">🌐 Vitrine Online</option>
                    <option value="WEBMOTORS">🚗 Webmotors</option>
                    <option value="OLX">📦 OLX</option>
                    <option value="INDICACAO">👥 Indicação de Cliente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Moto de Interesse</label>
                  <select
                    value={newLeadMotoId}
                    onChange={(e) => setNewLeadMotoId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="">Selecione uma moto do estoque...</option>
                    {motos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.brand} {m.model} ({m.plate}) - R$ {m.publicPrice.toLocaleString('pt-BR')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Orçamento Previsto (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 35000"
                    value={newLeadBudget || ''}
                    onChange={(e) => setNewLeadBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vendedor Responsável</label>
                  <select
                    value={newLeadSellerId}
                    onChange={(e) => setNewLeadSellerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="">Atribuir automaticamente a mim</option>
                    {team.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primeiro Próximo Passo</label>
                  <input
                    type="text"
                    value={newLeadNextAction}
                    onChange={(e) => setNewLeadNextAction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalNewLead(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingNewLead}
                  className="px-5 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  {savingNewLead ? 'Cadastrando...' : 'Cadastrar Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: MOTIVO OBRIGATÓRIO DE PERDA (PRD 08)             */}
      {/* ======================================================== */}
      {showModalLoss && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600">
                  Oportunidade Perdida (PRD 08)
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Registrar Motivo da Perda
                </h3>
              </div>
              <button
                onClick={() => setShowModalLoss(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              O registro do motivo é essencial para a análise de mercado, precificação do estoque e melhoria das taxas de conversão da loja.
            </p>

            <form onSubmit={handleConfirmLoss} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo Principal *</label>
                <select
                  required
                  value={lossReasonInput}
                  onChange={(e) => setLossReasonInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="Preço / Condição de pagamento alta">Preço / Condição de pagamento alta</option>
                  <option value="Financiamento bancário reprovado">Financiamento bancário reprovado</option>
                  <option value="Comprou em concorrente / outra loja">Comprou em concorrente / outra loja</option>
                  <option value="Desistiu da compra (momento pessoal)">Desistiu da compra (momento pessoal)</option>
                  <option value="Moto já foi vendida para outro cliente">Moto de interesse já vendida para outro</option>
                  <option value="Sem retorno / Não responde após tentativas">Sem retorno / Não atende nem responde</option>
                  <option value="Avaliação de moto de troca abaixo do esperado">Avaliação da troca abaixo do esperado</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalLoss(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 transition cursor-pointer"
                >
                  Confirmar Perda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: VISUALIZADOR & IMPRESSÃO OFICIAL A4 (PRD 09)    */}
      {/* ======================================================== */}
      {showModalPrintDoc && selectedDoc && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          {/* Barra de Ferramentas Superior (Ocultada na Impressão) */}
          <div className="w-full max-w-4xl bg-slate-900 text-white p-3 rounded-t-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl no-print border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#6d3df5]" />
              <div>
                <h4 className="text-xs font-bold text-white truncate max-w-sm">{selectedDoc.title}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="uppercase font-mono">{selectedDoc.type}</span>
                  <span>• Status: <b className={selectedDoc.status === 'ASSINADO' ? 'text-emerald-400' : 'text-amber-400'}>{selectedDoc.status}</b></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedDoc.status !== 'ASSINADO' && (
                <button
                  onClick={() => handleMarkDocSigned(selectedDoc.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" /> Registrar Assinatura
                </button>
              )}

              <button
                onClick={handlePrintCurrentDoc}
                className="px-4 py-1.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir / Salvar PDF
              </button>

              <button
                onClick={() => setShowModalPrintDoc(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Área do Documento Formatado A4 */}
          <div className="w-full max-w-4xl bg-slate-200/90 rounded-b-2xl p-4 sm:p-8 overflow-y-auto max-h-[85vh] shadow-2xl">
            <div
              dangerouslySetInnerHTML={{ __html: selectedDoc.contentHtml }}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EMISSÃO DE NOVO DOCUMENTO JURÍDICO (PRD 09)      */}
      {/* ======================================================== */}
      {showModalGenerateDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6d3df5]">
                  Emissor de Documentos Oficiais (PRD 09)
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Emitir Novo Documento / Contrato
                </h3>
              </div>
              <button
                onClick={() => setShowModalGenerateDoc(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateDocument} className="space-y-4">
              {/* Tipo de Documento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Documento Legal *</label>
                <select
                  required
                  value={genDocType}
                  onChange={(e) => setGenDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="CONTRATO_VENDA">📄 Contrato de Compra e Venda de Veículo Usado</option>
                  <option value="TERMO_GARANTIA">🛡️ Termo de Entrega Técnica & Garantia Legal de 90 Dias (CDC)</option>
                  <option value="RECIBO_SINAL">💰 Recibo de Sinal, Arras & Reserva de Veículo</option>
                  <option value="TERMO_RESPONSABILIDADE">⚠️ Termo de Responsabilidade sobre Multas e Infrações</option>
                </select>
              </div>

              {/* Vincular Venda ou Moto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 mb-1">Vincular a uma Venda (Auto-preenchimento)</label>
                  <select
                    value={genDocSaleId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      setGenDocSaleId(sId);
                      if (sId) {
                        const foundSale = sales.find((s) => s.id === sId);
                        if (foundSale) {
                          setGenDocMotoId(foundSale.motorcycle.id);
                          setGenDocBuyerName(foundSale.customer.name);
                          setGenDocBuyerDoc(foundSale.customer.document || '');
                          setGenDocBuyerPhone(foundSale.customer.phone);
                          setGenDocSalePrice(foundSale.salePrice);
                          setGenDocEntryAmount(foundSale.entryAmount || 0);
                        }
                      }
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs font-medium bg-white"
                  >
                    <option value="">Nenhuma (Preencher Manualmente)</option>
                    {sales.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.motorcycle.brand} {s.motorcycle.model} ({s.motorcycle.plate}) - {s.customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-900 mb-1">Motocicleta *</label>
                  <select
                    required
                    value={genDocMotoId}
                    onChange={(e) => {
                      const mId = e.target.value;
                      setGenDocMotoId(mId);
                      const m = motos.find((moto) => moto.id === mId);
                      if (m && !genDocSalePrice) {
                        setGenDocSalePrice(m.publicPrice);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs font-medium bg-white"
                  >
                    <option value="">Selecione uma moto do estoque...</option>
                    {motos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.brand} {m.model} ({m.plate}) - R$ {m.publicPrice.toLocaleString('pt-BR')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dados do Comprador */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-800 block">Dados do Comprador / Titular:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silveira"
                      value={genDocBuyerName}
                      onChange={(e) => setGenDocBuyerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">CPF ou CNPJ *</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={genDocBuyerDoc}
                      onChange={(e) => setGenDocBuyerDoc(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(48) 99999-9999"
                      value={genDocBuyerPhone}
                      onChange={(e) => setGenDocBuyerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Endereço Residencial</label>
                    <input
                      type="text"
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                      value={genDocBuyerAddress}
                      onChange={(e) => setGenDocBuyerAddress(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Condições Financeiras e Prazos */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-800 block">Condições Comerciais da Operação:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Preço Total da Venda (R$)</label>
                    <input
                      type="number"
                      required
                      value={genDocSalePrice || ''}
                      onChange={(e) => setGenDocSalePrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>

                  {genDocType !== 'RECIBO_SINAL' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Entrada Paga (R$)</label>
                      <input
                        type="number"
                        value={genDocEntryAmount || ''}
                        onChange={(e) => setGenDocEntryAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Valor do Sinal / Arras (R$)</label>
                        <input
                          type="number"
                          required
                          value={genDocDepositAmount || ''}
                          onChange={(e) => setGenDocDepositAmount(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Prazo da Reserva (Dias Úteis)</label>
                        <input
                          type="number"
                          required
                          value={genDocReservationDays}
                          onChange={(e) => setGenDocReservationDays(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModalGenerateDoc(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-5 py-2.5 bg-[#6d3df5] hover:bg-[#5b32d0] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  {savingDoc ? 'Gerando Documento...' : 'Gerar e Visualizar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
