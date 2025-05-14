
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AgentSetting } from "@/types";
import { getAgentSettings, updateAgentSettings } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AgentSetting[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getAgentSettings();
      setSettings(data);
      
      // Inicializar formValues com os valores atuais
      const initialValues: Record<string, string | number> = {};
      data.forEach((setting) => {
        initialValues[setting.key] = setting.value;
      });
      setFormValues(initialValues);
      
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do agente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (key: string, value: string | number) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [key]: value };
      
      // Verificar se há mudanças em relação aos valores originais
      let changed = false;
      for (const setting of settings) {
        if (String(newValues[setting.key]) !== String(setting.value)) {
          changed = true;
          break;
        }
      }
      
      setHasChanges(changed);
      return newValues;
    });
  };
  
  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      await updateAgentSettings(formValues);
      toast({
        title: "Sucesso",
        description: "As configurações foram salvas com sucesso.",
      });
      setHasChanges(false);
      await fetchSettings(); // Recarregar configurações
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Agrupar configurações por categoria
  const generalSettings = settings.filter((s) => s.category === "general");
  const promptSettings = settings.filter((s) => s.category === "prompts");
  const apiSettings = settings.filter((s) => s.category === "api");
  
  const renderSettingInput = (setting: AgentSetting) => {
    const value = formValues[setting.key] !== undefined ? formValues[setting.key] : setting.value;
    
    switch (setting.type) {
      case "number":
        return (
          <Input
            type="number"
            value={value as number}
            onChange={(e) => handleInputChange(setting.key, parseInt(e.target.value, 10) || 0)}
            className="max-w-md"
          />
        );
      case "textarea":
        return (
          <Textarea
            value={value as string}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            rows={5}
            className="font-mono text-sm"
          />
        );
      case "password":
        return (
          <Input
            type="password"
            value={value as string}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            placeholder="••••••••"
            className="max-w-md"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value as string}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="max-w-md"
          />
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações do Agente de Cotações</h1>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded-md w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(3).fill(null).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded-md w-1/5"></div>
                    <div className="h-10 bg-gray-200 rounded-md"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Configurações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Parâmetros gerais de comportamento do agente de cotações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generalSettings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">{setting.key}</label>
                    <p className="text-xs text-gray-500 mb-1">{setting.description}</p>
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Prompts e Textos de Mensagens */}
          <Card>
            <CardHeader>
              <CardTitle>Prompts e Textos de Mensagens</CardTitle>
              <CardDescription>
                Templates de mensagens e prompts utilizados pelo agente ao interagir com fornecedores e o sistema Gemini.
                Use placeholders como {"{marca_veiculo}"}, {"{modelo_veiculo}"}, etc. quando necessário.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {promptSettings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">{setting.key}</label>
                    <p className="text-xs text-gray-500 mb-1">{setting.description}</p>
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Configurações de API */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de API</CardTitle>
              <CardDescription>
                Chaves de API e URLs utilizados para integração com serviços externos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiSettings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium">{setting.key}</label>
                    <p className="text-xs text-gray-500 mb-1">{setting.description}</p>
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Botão de Salvar */}
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleSaveChanges} 
              disabled={isUpdating || !hasChanges}
              className="w-full sm:w-auto"
            >
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
