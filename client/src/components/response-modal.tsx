import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MethodBadge } from "./method-badge";
import type { ApiCall, ApiResponse, HttpMethod } from "@shared/schema";

interface ResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiCall: ApiCall | null;
  response: ApiResponse | null;
  error?: string | null;
}

export function ResponseModal({
  open,
  onOpenChange,
  apiCall,
  response,
  error,
}: ResponseModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
    if (status >= 300 && status < 400) return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    if (status >= 400 && status < 500) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
  };

  const formatBody = (body: string) => {
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return body;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] !bg-black/40 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 flex-wrap" data-testid="text-response-modal-title">
            {apiCall && (
              <>
                <MethodBadge method={apiCall.method} />
                <span className="font-mono text-sm truncate">{apiCall.url}</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-destructive/10 rounded-full mb-4">
              <X className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Request Failed</h3>
            <p className="text-sm text-muted-foreground max-w-md" data-testid="text-response-error">
              {error}
            </p>
          </div>
        ) : response ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge
                variant="secondary"
                className={getStatusColor(response.status)}
                data-testid="badge-response-status"
              >
                {response.status} {response.statusText}
              </Badge>
              <span className="text-sm text-muted-foreground" data-testid="text-response-duration">
                {response.duration}ms
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(response.timestamp).toLocaleString()}
              </span>
            </div>

            <Tabs defaultValue="body" className="w-full">
              <div className="flex items-center justify-between gap-2">
                <TabsList>
                  <TabsTrigger value="body" data-testid="tab-response-body">Body</TabsTrigger>
                  <TabsTrigger value="headers" data-testid="tab-response-headers">
                    Headers ({Object.keys(response.headers).length})
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(response.body)}
                  data-testid="button-copy-response"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <TabsContent value="body" className="mt-4">
                <ScrollArea className="h-[300px] rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm">
                  <pre
                    className="p-4 text-sm font-mono whitespace-pre-wrap break-all"
                    data-testid="text-response-body"
                  >
                    {formatBody(response.body)}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="headers" className="mt-4">
                <ScrollArea className="h-[300px] rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm">
                  <div className="p-4 space-y-2">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="flex gap-2" data-testid={`header-${key}`}>
                        <span className="font-mono text-sm font-semibold text-foreground">
                          {key}:
                        </span>
                        <span className="font-mono text-sm text-muted-foreground break-all">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <span className="text-muted-foreground">No response data</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
