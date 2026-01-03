import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, File, Image, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  name: string;
  file_url: string;
  document_type: string | null;
  uploaded_at: string;
}

export default function Documents() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    if (profile?.id) {
      fetchDocuments();
    }
  }, [profile?.id]);

  const fetchDocuments = async () => {
    if (!profile?.id) return;

    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('profile_id', profile.id)
      .order('uploaded_at', { ascending: false });

    if (data) {
      setDocuments(data as Document[]);
    }
  };

  const getFileIcon = (type: string | null) => {
    if (!type) return File;
    if (type.includes('image')) return Image;
    if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
    return FileText;
  };

  return (
    <DashboardLayout requiredRole="employee">
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Access your uploaded documents</p>
        </div>

        <div className="form-section">
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => {
                const Icon = getFileIcon(doc.document_type);
                return (
                  <div
                    key={doc.id}
                    className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No documents uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact your HR administrator to upload documents
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
