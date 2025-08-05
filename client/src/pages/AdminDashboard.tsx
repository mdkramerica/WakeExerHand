import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PatientDetailModal } from "@/components/patient-detail-modal";
import { IsolatedSelect } from "@/components/isolated-select";
import exerLogoPath from "@assets/ExerLogoColor_1750399504621.png";
import {
  Users,
  Activity,
  AlertTriangle,
  Calendar,
  Plus,
  Download,
  Search,
  Filter,
  Copy,
  LogOut,
  Stethoscope,
  FileDown,
  UserPlus,
  Eye,
  Database,
  Trash2,
  Edit,
  Home
} from "lucide-react";

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

interface ComplianceData {
  totalPatients: number;
  activePatients: number;
  totalAssessments: number;
  completedToday: number;
  complianceRate: number;
  assignedAssessments: number;
  completedAssessments: number;
}

interface Patient {
  id: number;
  patientId: string;
  code: string;
  injuryType: string;
  isActive: boolean;
  createdAt: string;
  lastVisit: string | null;
  surgeryDate: string | null;
  postOpDay: number;
  daysActive: number;
  assessmentCompletionRate: number;
  daysActiveRate: number;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newPatientDialog, setNewPatientDialog] = useState(false);
  const [selectedInjuryType, setSelectedInjuryType] = useState("");
  const [surgeryDate, setSurgeryDate] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Patient | null>(null);
  const [editInjuryType, setEditInjuryType] = useState("");
  const [editSurgeryDate, setEditSurgeryDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [injuryTypes, setInjuryTypes] = useState<string[]>([]);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const { toast } = useToast();

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async () => {
    try {
      const [complianceRes, patientsRes, injuryTypesRes] = await Promise.all([
        fetch('/api/admin/compliance', { headers: getAuthHeaders() }),
        fetch('/api/admin/patients', { headers: getAuthHeaders() }),
        fetch('/api/injury-types')
      ]);

      if (complianceRes.ok && patientsRes.ok) {
        const complianceData = await complianceRes.json();
        const patientsData = await patientsRes.json();
        
        setComplianceData(complianceData);
        setPatients(patientsData);
        setFilteredPatients(patientsData);
      }

      if (injuryTypesRes.ok) {
        const injuryTypesData = await injuryTypesRes.json();
        setInjuryTypes(injuryTypesData.injuryTypes.map((it: any) => it.name));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.code.includes(searchTerm) ||
        patient.injuryType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(patient => {
        const status = getPatientStatus(patient);
        return status === statusFilter;
      });
    }

    setFilteredPatients(filtered);
  }, [searchTerm, statusFilter, patients]);

  const getPatientStatus = (patient: Patient) => {
    if (!patient.lastVisit) return "non-compliant";
    
    const lastVisit = new Date(patient.lastVisit);
    const daysSince = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince <= 1) return "active";
    if (daysSince <= 3) return "at-risk";
    return "non-compliant";
  };

  const getStatusBadge = (patient: Patient) => {
    const status = getPatientStatus(patient);
    const variants = {
      active: "default",
      "at-risk": "secondary", 
      "non-compliant": "destructive"
    } as const;
    
    const labels = {
      active: "Active",
      "at-risk": "At Risk",
      "non-compliant": "Non-Compliant"
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getComplianceStyle = (complianceRate: number) => {
    if (complianceRate < 60) {
      return {
        backgroundColor: '#fef2f2', // red-50
        borderColor: '#dc2626', // red-600
        color: '#dc2626'
      };
    } else if (complianceRate < 75) {
      return {
        backgroundColor: '#fefce8', // yellow-50
        borderColor: '#ca8a04', // yellow-600
        color: '#ca8a04'
      };
    } else {
      return {
        backgroundColor: '#f0fdf4', // green-50
        borderColor: '#16a34a', // green-600
        color: '#16a34a'
      };
    }
  };

  const copyAccessCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied",
        description: `Access code ${code} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Error", 
        description: "Failed to copy code",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = (patient: Patient) => {
    setUserToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "User Deleted",
          description: `User ${userToDelete.code} and ${data.deletedUser.assessmentsDeleted} assessments have been permanently deleted`,
        });

        setDeleteDialogOpen(false);
        setUserToDelete(null);
        await fetchData(); // Refresh patient list
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditUser = (patient: Patient) => {
    setUserToEdit(patient);
    setEditInjuryType(patient.injuryType || "");
    setEditSurgeryDate(patient.surgeryDate ? patient.surgeryDate.split('T')[0] : "");
    setEditDialogOpen(true);
  };

  const confirmUpdateUser = async () => {
    if (!userToEdit) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${userToEdit.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          injuryType: editInjuryType,
          surgeryDate: editSurgeryDate || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "User Updated",
          description: `User ${userToEdit.code} has been successfully updated`,
        });

        setEditDialogOpen(false);
        setUserToEdit(null);
        setEditInjuryType("");
        setEditSurgeryDate("");
        await fetchData(); // Refresh patient list
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const createNewPatient = async () => {
    if (!selectedInjuryType) return;

    setCreatingPatient(true);
    try {
      const requestBody: any = { injuryType: selectedInjuryType };
      if (surgeryDate) {
        requestBody.surgeryDate = surgeryDate;
      }

      const response = await fetch('/api/admin/generate-code', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Patient Created",
          description: data.message,
        });

        setNewPatientDialog(false);
        setSelectedInjuryType("");
        setSurgeryDate("");
        await fetchData(); // Refresh patient list
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive"
      });
    } finally {
      setCreatingPatient(false);
    }
  };

  const downloadPatientData = async (patientId: number) => {
    try {
      const response = await fetch(`/api/admin/download/${patientId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patient_${data.patient.patientId}_motion_data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Download Started",
          description: `Motion data for ${data.patient.patientId} is downloading`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download patient data",
        variant: "destructive"
      });
    }
  };

  // CSV Export functionality
  const exportPatientsCsv = async () => {
    setExportingCsv(true);
    try {
      const response = await fetch('/api/admin/patients/csv', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PatientData_Export_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "CSV Export Complete",
          description: "Patient data has been exported successfully",
        });
      } else {
        throw new Error('Failed to export CSV');
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export patient data as CSV",
        variant: "destructive"
      });
    } finally {
      setExportingCsv(false);
    }
  };

  // Open patient detail modal
  const openPatientDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
  };

  const exportAllData = async () => {
    setExportingData(true);
    try {
      const response = await fetch('/api/admin/export', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        // Handle zip file download
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Extract filename from Content-Disposition header or create default
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `exer_ai_system_export_${new Date().toISOString().split('T')[0]}.zip`;
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Complete",
          description: "System data downloaded as ZIP file with structured patient data",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "Failed to export system data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExportingData(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard min-h-screen bg-gray-50 dark:bg-gray-900" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src={exerLogoPath} 
                alt="ExerAI Logo" 
                className="h-8 w-auto"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                ExerAI Admin Portal
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={exportAllData} variant="outline" size="sm" disabled={exportingData}>
                <FileDown className="h-4 w-4 mr-2" />
                {exportingData ? "Exporting..." : "Export Data"}
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.firstName} {user?.lastName}
                </span>
                <Button onClick={onLogout} variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Metrics */}
        {complianceData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card style={{ backgroundColor: '#FFFFFF' }}>
              <CardContent className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Patients
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {complianceData.totalPatients}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: '#FFFFFF' }}>
              <CardContent className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Compliance Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {complianceData.complianceRate}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {complianceData.completedAssessments} of {complianceData.assignedAssessments} assigned
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: '#FFFFFF' }}>
              <CardContent className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      At Risk
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {complianceData.activePatients}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: '#FFFFFF' }}>
              <CardContent className="p-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Today's Assessments
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {complianceData.completedToday}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Patient Management */}
        <Card style={{ backgroundColor: '#FFFFFF' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Patient Management</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  onClick={exportPatientsCsv} 
                  disabled={exportingCsv}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  {exportingCsv ? "Exporting..." : "Export CSV"}
                </Button>
                
                <Dialog open={newPatientDialog} onOpenChange={setNewPatientDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Patient
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register New Patient</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="injuryType">Injury Type</Label>
                      <IsolatedSelect
                        id="injuryType"
                        value={selectedInjuryType}
                        onValueChange={setSelectedInjuryType}
                        placeholder="Select injury type"
                        options={[
                          { value: "Trigger Finger", label: "Trigger Finger" },
                          { value: "Carpal Tunnel", label: "Carpal Tunnel" },
                          { value: "Distal Radius Fracture", label: "Distal Radius Fracture" },
                          { value: "CMC Arthroplasty", label: "CMC Arthroplasty" }
                        ]}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="surgeryDate">Surgery Date (Optional)</Label>
                      <Input
                        id="surgeryDate"
                        type="date"
                        value={surgeryDate}
                        onChange={(e) => setSurgeryDate(e.target.value)}
                        placeholder="Select surgery date"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used to track post-operative day and recovery progress
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={createNewPatient}
                      disabled={!selectedInjuryType || creatingPatient}
                    >
                      {creatingPatient ? "Creating..." : "Create Patient"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                <IsolatedSelect
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder="Filter by status"
                  className="w-48 pl-10"
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "at-risk", label: "At Risk" },
                    { value: "non-compliant", label: "Non-Compliant" }
                  ]}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Patient ID</th>
                    <th className="text-left p-2">Access Code</th>
                    <th className="text-left p-2">Injury Type</th>
                    <th className="text-left p-2">Surgery Date</th>
                    <th className="text-left p-2">Post-Op Day</th>
                    <th className="text-left p-2">Days Active</th>
                    <th className="text-left p-2">Assessment %</th>
                    <th className="text-left p-2">Days Active %</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => openPatientDetail(patient)}
                    >
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-medium">
                            {patient.patientId.slice(-2)}
                          </div>
                          <span className="font-medium">{patient.patientId}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-blue-600">
                            {patient.code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyAccessCode(patient.code);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-2">{patient.injuryType}</td>
                      <td className="p-2">
                        {patient.surgeryDate 
                          ? new Date(patient.surgeryDate).toLocaleDateString()
                          : "Not Set"
                        }
                      </td>
                      <td className="p-2">
                        {patient.postOpDay !== null && patient.postOpDay >= 0
                          ? `Day ${patient.postOpDay}`
                          : "N/A"
                        }
                      </td>
                      <td className="p-2">
                        {patient.daysActive || 0}
                      </td>
                      <td 
                        className="p-2"
                        style={{
                          ...getComplianceStyle(patient.assessmentCompletionRate),
                          border: `2px solid ${getComplianceStyle(patient.assessmentCompletionRate).borderColor}`,
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}
                      >
                        {patient.assessmentCompletionRate}%
                      </td>
                      <td 
                        className="p-2"
                        style={{
                          ...getComplianceStyle(patient.daysActiveRate),
                          border: `2px solid ${getComplianceStyle(patient.daysActiveRate).borderColor}`,
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}
                      >
                        {patient.daysActiveRate}%
                      </td>
                      <td className="p-2">{getStatusBadge(patient)}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPatientDetail(patient);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(patient);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadPatientData(patient.id);
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(patient);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No patients found matching your criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Patient Detail Modal */}
      <PatientDetailModal 
        patient={selectedPatient}
        isOpen={showPatientDetail}
        onClose={() => {
          setShowPatientDetail(false);
          setSelectedPatient(null);
        }}
      />

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-injury-type">Injury Type</Label>
              <IsolatedSelect
                id="edit-injury-type"
                value={editInjuryType}
                onValueChange={setEditInjuryType}
                placeholder="Select injury type"
                options={[
                  { value: "Trigger Finger", label: "Trigger Finger" },
                  { value: "Carpal Tunnel", label: "Carpal Tunnel" },
                  { value: "Distal Radius Fracture", label: "Distal Radius Fracture" },
                  { value: "CMC Arthroplasty", label: "CMC Arthroplasty" }
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-surgery-date">Surgery Date (Optional)</Label>
              <Input
                id="edit-surgery-date"
                type="date"
                value={editSurgeryDate}
                onChange={(e) => setEditSurgeryDate(e.target.value)}
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <span className="font-medium">User:</span> {userToEdit?.code}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <span className="font-medium">Current Injury:</span> {userToEdit?.injuryType || "Not set"}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <span className="font-medium">Current Surgery Date:</span> {userToEdit?.surgeryDate ? new Date(userToEdit.surgeryDate).toLocaleDateString() : "Not set"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmUpdateUser}
              disabled={isUpdating || !editInjuryType}
            >
              {isUpdating ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to permanently delete user <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{userToDelete?.code}</span>?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              ⚠️ This action cannot be undone. All assessment data for this user will be permanently deleted.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}