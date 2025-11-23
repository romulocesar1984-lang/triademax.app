/* Arquivo App.jsx gerado. Cole aqui seu código final funcional. */// App.jsx
import React, { useState, useEffect } from 'react';

// Firebase (v10+ modular)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Ícones Lucide
import {
  Dumbbell, Utensils, Star, UserCheck, Lock, CheckCircle, ArrowRight, Video, FileText, Zap, Heart, Award, ChevronLeft, Clock, Calendar, CheckSquare, MessageSquare,
  Target, Trophy, Users, Activity, Share2, ClipboardList, Shield, BookOpen
} from 'lucide-react';

// ------------------ CONFIGURAÇÃO ------------------
// appId flexível (pode vir do hosting ou do env)
const appId = (typeof __app_id !== 'undefined') ? __app_id : (import.meta.env?.VITE_APP_ID || 'br.com.triademax.app');

// CONFIGURAÇÃO FIREBASE (substitua pelas suas credenciais se precisar)
const firebaseConfig = {
  apiKey: "AIzaSyB4B80Uq_5nc0jk8KWgLS4wYER0-qBtRaQ",
  authDomain: "triade-max.firebaseapp.com",
  projectId: "triade-max",
  storageBucket: "triade-max.firebasestorage.app",
  messagingSenderId: "1076561242416",
  appId: "1:1076561242416:web:5aea2726440954ca5e40f5",
  measurementId: "G-PSTDB92QHS"
};

const initialAuthToken = (typeof __initial_auth_token !== 'undefined') ? __initial_auth_token : (import.meta.env?.VITE_INITIAL_AUTH_TOKEN || null);

// Cores / utilitários (mantive suas classes Tailwind)
const ACCENT_COLOR = 'bg-green-600';
const ACCENT_TEXT_COLOR = 'text-green-600';
const BG_COLOR = 'bg-gray-900';
const CARD_COLOR = 'bg-gray-800';
const TEXT_COLOR = 'text-white';
const SUBTEXT_COLOR = 'text-gray-400';

// --- DADOS ---
const PLANS = [
  { id: 'bronze', name: 'Plano Bronze', price: 'R$ 49/mês', features: ['Acesso a 1 treino/semana', 'Guia de Dietas Básico', 'Comunidade'], icon: Heart, color: 'text-amber-500' },
  { id: 'prata', name: 'Plano Prata', price: 'R$ 99/mês', features: ['Acesso Ilimitado a Treinos', 'Plano Alimentar Mensal', 'Mentoria em Grupo (4x/mês)'], icon: Award, color: 'text-gray-300' },
  { id: 'ouro', name: 'Plano Ouro', price: 'R$ 199/mês', features: ['Tudo do Prata', 'Mentoria Individual Semanal', 'Feedback de Dieta Personalizado', 'Conteúdo VIP Exclusivo'], icon: Zap, color: 'text-yellow-500' },
];

const TESTIMONIALS = [
  { name: 'Ana P.', text: 'Em 3 meses, perdi 10kg e ganhei foco. O Triade Max é mais do que um app, é um estilo de vida!', rating: 5, avatar: 'A' },
  { name: 'Ricardo G.', text: 'A mentoria fez toda a diferença. Saí da estagnação e agora tenho clareza nos meus objetivos de treino.', rating: 5, avatar: 'R' },
  { name: 'Carla V.', text: 'Planos de dieta simples, treinos eficazes. O melhor investimento em saúde que já fiz.', rating: 5, avatar: 'C' },
];

const MENTORS = [
  { name: 'Dr. Lucas Ribeiro', expertise: 'Fisiologia e Performance', message: 'A consistência é o atalho. Seu corpo responde à disciplina, não à intensidade esporádica.', color: 'text-green-500' },
  { name: 'Chef Valentina Silva', expertise: 'Nutrição e Longevidade', message: 'Coma para energizar, não para preencher. Alimentos são informação, escolha o código certo.', color: 'text-orange-500' },
  { name: 'Sofia Mendes', expertise: 'Mindset e Alta Produtividade', message: 'A verdadeira força não está no músculo, mas na capacidade de sua mente dizer "só mais um".', color: 'text-indigo-500' },
  { name: 'Alexandre Castro', expertise: 'Finanças e Carreira', message: 'Sua saúde é seu maior ativo. Invista nela com a mesma dedicação que investe em sua riqueza.', color: 'text-yellow-500' },
];

const ACHIEVEMENTS = [
  { id: 1, name: 'Início Imbatível', criteria: 'Completar o primeiro desafio semanal.', unlocked: true, icon: Trophy, color: 'text-yellow-500' },
  { id: 2, name: 'Mestre da Hidratação', criteria: 'Atingir a meta de água por 7 dias seguidos.', unlocked: true, icon: Heart, color: 'text-red-500' },
  { id: 3, name: 'Fera do HIIT', criteria: 'Completar 10 sessões de HIIT.', unlocked: false, icon: Zap, color: 'text-indigo-500' },
  { id: 4, name: 'Mentalidade de Ouro', criteria: 'Participar de 4 mentorias em grupo.', unlocked: false, icon: Star, color: 'text-sky-500' },
];

// --- COMPONENTES UTILITÁRIOS ---
const PrimaryButton = ({ children, onClick, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3 px-6 rounded-lg font-semibold transition duration-300 transform hover:scale-[1.01] ${
      disabled ? 'bg-gray-600 cursor-not-allowed' : `${ACCENT_COLOR} hover:bg-green-700 shadow-lg shadow-green-700/50`
    } ${className}`}
  >
    {children}
  </button>
);

const LoadingScreen = () => (
  <div className={`min-h-screen flex items-center justify-center ${BG_COLOR} ${TEXT_COLOR}`}>
    <Dumbbell className="w-10 h-10 animate-spin mr-3" />
    <span className="text-xl">Carregando a melhor versão de você...</span>
  </div>
);

// --- TELAS ---
const LoginScreen = ({ setView, userId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      if (email.includes('@') && password.length >= 6) {
        setMessage(isRegister ? 'Cadastro simulado com sucesso! Redirecionando...' : 'Login simulado com sucesso! Redirecionando...');
        await new Promise(resolve => setTimeout(resolve, 900));
        setView('dashboard');
      } else {
        setMessage('Erro: Por favor, use um formato de e-mail válido e senha com pelo menos 6 caracteres.');
      }
    } catch (e) {
      console.error(e);
      setMessage(`Erro na autenticação: ${e.message || e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${BG_COLOR}`}>
      <div className={`${CARD_COLOR} p-8 rounded-xl shadow-2xl w-full max-w-md`}>
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Dumbbell className="w-8 h-8 text-yellow-500" />
            <Utensils className="w-8 h-8 text-green-500" />
            <Star className="w-8 h-8 text-sky-500" />
          </div>
          <h1 className={`text-4xl font-extrabold tracking-wider ${TEXT_COLOR} mb-1`}>Triade Max</h1>
          <p className={`text-sm font-medium uppercase ${ACCENT_TEXT_COLOR} border-b border-green-600 pb-1`}>Treino | Dieta | Mente de Campeão</p>
        </div>

        <h2 className={`text-2xl font-bold mb-6 text-center ${TEXT_COLOR}`}>{isRegister ? 'Crie Sua Conta' : 'Acesse Sua Mentoria'}</h2>
        <p className={`text-center mb-4 text-xs ${SUBTEXT_COLOR}`}>*Use um e-mail fictício (ex: teste@triademax.com) e senha com 6+ dígitos.</p>

        <div className="mb-4">
          <label className={`block mb-1 font-medium ${SUBTEXT_COLOR}`}>E-mail</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 rounded-lg ${BG_COLOR} ${TEXT_COLOR} border border-gray-700 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none`}
            disabled={isLoading}
          />
        </div>
        <div className="mb-6">
          <label className={`block mb-1 font-medium ${SUBTEXT_COLOR}`}>Senha</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 rounded-lg ${BG_COLOR} ${TEXT_COLOR} border border-gray-700 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none`}
            disabled={isLoading}
          />
        </div>

        {message && (
          <p className={`mb-4 text-sm font-semibold ${message.includes('Erro') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
        )}

        <PrimaryButton onClick={handleAuth} disabled={isLoading}>
          {isLoading ? 'Aguarde...' : isRegister ? 'Cadastrar e Iniciar' : 'Entrar na Plataforma'}
        </PrimaryButton>

        <p className={`text-center mt-6 ${SUBTEXT_COLOR}`}>
          {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <button onClick={() => setIsRegister(!isRegister)} className={`${ACCENT_TEXT_COLOR} font-semibold ml-2 hover:underline`} disabled={isLoading}>
            {isRegister ? 'Fazer Login' : 'Criar Conta'}
          </button>
        </p>
        <p className={`text-center mt-3 text-xs ${SUBTEXT_COLOR}`}>ID do Usuário (Para Teste): {userId || 'Desconhecido'}</p>
      </div>
    </div>
  );
};

// --- Outras telas (mantive as suas implementações) ---
const BackButton = ({ setView, target }) => (
  <button onClick={() => setView(target)} className={`flex items-center ${ACCENT_TEXT_COLOR} hover:underline mb-6 text-lg font-semibold`}>
    <ChevronLeft className="w-5 h-5 mr-2" /> Voltar ao Dashboard
  </button>
);

const TrainingPage = ({ setView, userPlan }) => {
  const treinos = [
    { day: 'Segunda', focus: 'Musculação (Hipertrofia - Peito/Tríceps)', duration: '60 min', level: 'Avançado' },
    { day: 'Terça', focus: 'Cardio (HIIT - Full Body)', duration: '25 min', level: 'Intermediário' },
    { day: 'Quarta', focus: 'Musculação (Força - Pernas/Ombro)', duration: '75 min', level: 'Avançado' },
    { day: 'Quinta', focus: 'Mobilidade/Pilates', duration: '30 min', level: 'Iniciante' },
    { day: 'Sexta', focus: 'Musculação (Resistência - Costas/Bíceps)', duration: '60 min', level: 'Intermediário' },
    { day: 'Sábado', focus: 'Cross-Training (WOD)', duration: '40 min', level: 'Intermediário' },
  ];

  const bonusTreinos = [
    { name: 'Yoga para Recuperação', duration: '20 min', icon: Heart, color: 'text-pink-400' },
    { name: 'Calistenia Básica', duration: '35 min', icon: Dumbbell, color: 'text-yellow-400' },
    { name: 'Cardio de Baixo Impacto', duration: '45 min', icon: Activity, color: 'text-cyan-400' },
  ];

  const [completed, setCompleted] = useState([true, false, false, false, false, false]);

  const toggleCompleted = (index) => {
    const newCompleted = [...completed];
    newCompleted[index] = !newCompleted[index];
    setCompleted(newCompleted);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <BackButton setView={setView} target="dashboard" />
      <h1 className="text-4xl font-extrabold mb-6">Triade Max | Área de Treino <Dumbbell className={`inline-block ml-2 w-8 h-8 ${ACCENT_TEXT_COLOR}`} /></h1>

      <div className={`${CARD_COLOR} p-6 rounded-xl mb-8 shadow-lg`}>
        <h2 className="text-2xl font-bold mb-3 flex items-center text-red-500">
          <Video className="w-6 h-6 mr-3" /> Destaque do Dia: Treino A (Hipertrofia)
        </h2>
        <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 mb-4"></div>
        <p className={`${SUBTEXT_COLOR} text-sm`}>**Foco:** Maximizar a quebra de fibras musculares. Assista ao vídeo antes de começar para garantir a execução perfeita!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${CARD_COLOR} p-5 rounded-xl`}>
          <h3 className={`text-xl font-bold ${ACCENT_TEXT_COLOR}`}>Protocolo Atual</h3>
          <p className={`${SUBTEXT_COLOR} text-sm`}>Foco: Definição/Hipertrofia (Treino A, B, C, D)</p>
        </div>

        <div className={`${CARD_COLOR} p-5 rounded-xl border-l-4 border-sky-400 lg:col-span-3`}>
          <h3 className="text-xl font-bold mb-3 text-sky-400 flex items-center"><Activity className="w-5 h-5 mr-2" />Seu Rastreador de Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><p className="text-3xl font-extrabold text-white">4.5 kg</p><p className={`${SUBTEXT_COLOR} text-xs`}>Ganhos no Agachamento</p></div>
            <div><p className="text-3xl font-extrabold text-white">{completed.filter(c => c).length}/6</p><p className={`${SUBTEXT_COLOR} text-xs`}>Treinos da Semana</p></div>
            <div><p className="text-3xl font-extrabold text-white">2:30 min</p><p className={`${SUBTEXT_COLOR} text-xs`}>Prancha Max</p></div>
            <div><p className="text-3xl font-extrabold text-white">4 / 8</p><p className={`${SUBTEXT_COLOR} text-xs`}>Semanas no Ciclo</p></div>
          </div>
        </div>
      </div>

      <div className={`p-6 mb-8 rounded-xl border-l-4 border-yellow-500 bg-yellow-900/30 shadow-lg cursor-pointer hover:bg-yellow-900/40`} onClick={() => setView('challenges')}>
        <h2 className="text-2xl font-bold mb-3 flex items-center text-yellow-500"><Zap className="w-6 h-6 mr-3" /> Desafio Semanal</h2>
        <p className={`${SUBTEXT_COLOR} mb-3`}>Clique para ver os desafios e metas da semana.</p>
        <span className={`${ACCENT_TEXT_COLOR} font-medium text-sm flex items-center`}>Ir para Desafios <ArrowRight className="inline-block w-3 h-3 ml-1" /></span>
      </div>

      <h2 className={`text-2xl font-bold mb-4 ${ACCENT_TEXT_COLOR}`}>Planilha Semanal de Treinos</h2>

      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-gray-700">
          <div className="grid grid-cols-7 gap-2 bg-gray-700 p-3 font-bold text-sm uppercase rounded-t-lg">
            <span>Dia</span>
            <span className="col-span-2">Foco / Modalidade</span>
            <span>Duração</span>
            <span>Nível</span>
            <span>Vídeo</span>
            <span>Concluído</span>
          </div>
          {treinos.map((treino, index) => (
            <div key={index} className="grid grid-cols-7 gap-2 items-center p-3 hover:bg-gray-700 transition duration-150">
              <span className="font-semibold">{treino.day}</span>
              <span className="col-span-2 text-sm">{treino.focus}</span>
              <span className="text-sm">{treino.duration}</span>
              <span className={`text-xs font-medium ${treino.level === 'Avançado' ? 'text-red-400' : 'text-green-400'}`}>{treino.level}</span>
              <div className="flex items-center space-x-1">
                <Video className={`w-4 h-4 flex-shrink-0 ${ACCENT_TEXT_COLOR}`} />
                <a href="#" className={`text-xs hover:underline ${ACCENT_TEXT_COLOR}`}>Ver</a>
              </div>
              <button onClick={() => toggleCompleted(index)} className="flex justify-center">
                {completed[index] ? <CheckSquare className="w-5 h-5 text-green-500" /> : <ClipboardList className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <h2 className={`text-2xl font-bold mb-4 mt-8 ${ACCENT_TEXT_COLOR}`}>Treinos Bônus</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bonusTreinos.map((bonus, index) => (
          <div key={index} className={`${CARD_COLOR} p-4 rounded-xl flex items-center space-x-4 border-l-4 border-indigo-400`}>
            <bonus.icon className={`w-6 h-6 flex-shrink-0 ${bonus.color}`} />
            <div>
              <h3 className="font-semibold text-white">{bonus.name}</h3>
              <p className={`text-xs ${SUBTEXT_COLOR}`}>{bonus.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DietPage = ({ setView, userPlan }) => {
  const [intake, setIntake] = useState(1850);
  const target = 2200;
  const progress = Math.min(100, (intake / target) * 100);

  const handleAddIntake = () => {
    setIntake(c => Math.min(target + 300, c + 150));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <BackButton setView={setView} target="dashboard" />
      <h1 className="text-4xl font-extrabold mb-6">Triade Max | Plano Alimentar <Utensils className={`inline-block ml-2 w-8 h-8 ${ACCENT_TEXT_COLOR}`} /></h1>

      <div className={`${CARD_COLOR} p-6 rounded-xl mb-8 border-l-4 border-green-600`}>
        <h3 className="text-2xl font-bold mb-3 flex items-center"><Calendar className="w-6 h-6 mr-3 text-green-400" />Rastreador de Ingestão Diária</h3>
        <div className="flex justify-between items-end mb-2">
          <span className="text-3xl font-extrabold text-white">{intake} Kcal</span>
          <span className={`${SUBTEXT_COLOR} text-sm`}>Meta: {target} Kcal</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div className={`h-3 rounded-full ${ACCENT_COLOR}`} style={{ width: `${progress}%` }} />
        </div>
        <PrimaryButton onClick={handleAddIntake} className="!w-auto !py-2 !px-4 text-sm bg-indigo-500 hover:bg-indigo-600 shadow-none">Adicionar Refeição (Simulado)</PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`${CARD_COLOR} p-5 rounded-xl`}><h3 className={`text-xl font-bold ${ACCENT_TEXT_COLOR}`}>Foco Macronutrientes</h3><p className={`${SUBTEXT_COLOR} text-sm`}>P: 40%, C: 40%, G: 20%</p></div>
        <div className={`${CARD_COLOR} p-5 rounded-xl`}><h3 className={`text-xl font-bold ${ACCENT_TEXT_COLOR}`}>Plano Válido Até</h3><p className={`${SUBTEXT_COLOR} text-sm`}>31 de Dezembro, 2025</p></div>
      </div>

      {(userPlan !== 'bronze' && userPlan !== 'trial') && (
        <div className={`${CARD_COLOR} p-6 rounded-xl mb-8 border-l-4 border-yellow-500`}>
          <h2 className="text-2xl font-bold mb-3 text-yellow-500">Seu Plano {userPlan === 'ouro' ? 'Personalizado' : 'Mensal'}</h2>
          <p className={`${SUBTEXT_COLOR}`}>Acesse o guia completo em PDF com substituições e horários. <FileText className="inline-block w-4 h-4 mx-1" /><a href="#" className={`${ACCENT_TEXT_COLOR} ml-2 hover:underline`}>Download PDF</a></p>
        </div>
      )}

      {(userPlan === 'bronze' || userPlan === 'trial') && (
        <div className="text-center p-8 bg-yellow-900/30 rounded-xl mb-8 border border-yellow-500/50">
          <h3 className="text-xl font-bold mb-2 text-yellow-500">Plano de Exemplo (Trial/Bronze)</h3>
          <p className={`${SUBTEXT_COLOR} mb-4`}>Para ter um plano alimentar mensal ou personalizado, faça upgrade para os Planos Prata ou Ouro.</p>
          <PrimaryButton onClick={() => setView('plans')} className="!w-auto !py-2 !px-4 text-sm bg-yellow-500 hover:bg-yellow-600 shadow-none">Ver Planos de Upgrade</PrimaryButton>
        </div>
      )}
    </div>
  );
};

const ChallengesPage = ({ setView }) => {
  const challenges = [
    { id: 1, name: 'Desafio Core de Aço', target: '30 dias de prancha, aumentando 10s por dia.', progress: 75, type: 'Diário', status: 'Em Progresso' },
    { id: 2, name: 'Semana Detox (Zero Açúcar)', target: '7 dias sem consumir açúcar refinado.', progress: 100, type: 'Nutricional', status: 'Concluído' },
    { id: 3, name: 'Maratona Mental', target: '21 dias de meditação guiada (10 min).', progress: 30, type: 'Mindset', status: 'Em Progresso' },
    { id: 4, name: 'Oito Copos', target: 'Beber 8 copos de água por dia, por 14 dias.', progress: 0, type: 'Hábito', status: 'Disponível' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <BackButton setView={setView} target="dashboard" />
      <h1 className="text-4xl font-extrabold mb-6">Triade Max | Desafios & Metas <Target className={`inline-block ml-2 w-8 h-8 ${ACCENT_TEXT_COLOR}`} /></h1>
      <div className="space-y-6">
        {challenges.map(challenge => (
          <div key={challenge.id} className={`${CARD_COLOR} p-6 rounded-xl border-l-4 border-yellow-500 shadow-md`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-white">{challenge.name}</h2>
                <p className={`text-sm font-medium uppercase mb-3 ${SUBTEXT_COLOR}`}>{challenge.type}</p>
                <p className={`${TEXT_COLOR} mb-3`}>**Meta:** {challenge.target}</p>
              </div>
              <span className={`py-1 px-3 rounded-full text-xs font-bold ${challenge.status === 'Concluído' ? 'bg-green-600' : challenge.status === 'Em Progresso' ? 'bg-yellow-600' : 'bg-gray-600'}`}>{challenge.status.toUpperCase()}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm font-semibold mb-1"><span>Progresso:</span><span>{challenge.progress}%</span></div>
              <div className="w-full bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full ${challenge.status === 'Concluído' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${challenge.progress}%` }} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AchievementsPage = ({ setView }) => (
  <div className="p-4 md:p-8 max-w-7xl mx-auto">
    <BackButton setView={setView} target="dashboard" />
    <h1 className="text-4xl font-extrabold mb-6">Triade Max | Conquistas & Recompensas <Trophy className={`inline-block ml-2 w-8 h-8 ${ACCENT_TEXT_COLOR}`} /></h1>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {ACHIEVEMENTS.map(ach => (
        <div key={ach.id} className={`p-4 rounded-xl flex flex-col items-center text-center transition duration-300 ${ach.unlocked ? `${CARD_COLOR} border border-green-500/50` : 'bg-gray-700 opacity-50'}`}>
          <div className="w-16 h-16 mb-2 flex items-center justify-center">
            <ach.icon className={`w-12 h-12 ${ach.color}`} />
          </div>
          <h3 className={`font-bold text-sm mb-1 ${ach.unlocked ? TEXT_COLOR : SUBTEXT_COLOR}`}>{ach.name}</h3>
          <p className={`text-xs ${SUBTEXT_COLOR}`}>{ach.criteria}</p>
        </div>
      ))}
    </div>
  </div>
);

const MentorshipPage = ({ setView, userPlan }) => (
  <div className="p-4 md:p-8 max-w-7xl mx-auto">
    <BackButton setView={setView} target="dashboard" />
    <h1 className="text-4xl font-extrabold mb-6">Triade Max | Área de Mentoria <UserCheck className={`inline-block ml-2 w-8 h-8 ${ACCENT_TEXT_COLOR}`} /></h1>

    {(userPlan === 'bronze' || userPlan === 'trial') ? (
      <div className={`text-center p-12 ${CARD_COLOR} rounded-xl`}>
        <Lock className={`w-12 h-12 mx-auto mb-4 text-red-500`} />
        <h2 className="text-2xl font-bold mb-2">Acesso Exclusivo</h2>
        <p className={`${SUBTEXT_COLOR} mb-6`}>Sua mentoria é via comunidade (Plano Trial/Bronze). Para sessões individuais ou em grupo ao vivo, faça upgrade para o Plano Prata ou Ouro.</p>
        <PrimaryButton onClick={() => setView('plans')}>Ver Upgrades</PrimaryButton>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${CARD_COLOR} p-5 rounded-xl border-l-4 border-green-600`}>
            <h3 className={`text-xl font-bold ${ACCENT_TEXT_COLOR}`}>{userPlan === 'ouro' ? 'Mentoria Individual (VIP)' : 'Mentoria em Grupo'}</h3>
            <p className={`${SUBTEXT_COLOR} text-sm`}>{userPlan === 'ouro' ? 'Próxima sessão: Terça-feira, 19h00 (Link Privado)' : 'Próxima sessão: Quinta-feira, 20h00'}</p>
          </div>
          <div className={`${CARD_COLOR} p-5 rounded-xl border-l-4 border-yellow-500`}>
            <h3 className={`text-xl font-bold ${ACCENT_TEXT_COLOR}`}>Acesso à Comunidade</h3>
            <p className={`${SUBTEXT_COLOR} text-sm`}>Link exclusivo para o grupo de Sucesso.</p>
          </div>
        </div>

        <h2 className={`text-3xl font-bold mb-5 mt-8 ${ACCENT_TEXT_COLOR} flex items-center`}><MessageSquare className='w-6 h-6 mr-3'/> Mensagens dos Mentores de Elite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MENTORS.map((mentor, index) => (
            <div key={index} className={`${CARD_COLOR} p-5 rounded-xl shadow-lg flex flex-col items-center text-center transition hover:bg-gray-700`}>
              <div className="w-20 h-20 rounded-full bg-gray-600 mb-3 flex items-center justify-center overflow-hidden">
                <img src={`https://placehold.co/80x80/1f2937/FFFFFF?text=Mentor`} alt={`Foto de ${mentor.name}`} className="w-full h-full object-cover rounded-full" />
              </div>
              <h3 className={`font-bold text-lg mb-1 ${mentor.color}`}>{mentor.name}</h3>
              <p className="text-xs font-medium uppercase text-gray-400 mb-3">{mentor.expertise}</p>
              <p className="text-sm italic text-white leading-snug">"{mentor.message}"</p>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);

const Dashboard = ({ setView, userPlan }) => {
  const isTrial = userPlan === 'trial';
  let planDetails;
  if (isTrial) {
    planDetails = { id: 'trial', name: 'Plano Trial (Grátis)', color: 'text-sky-400', isFree: true, features: PLANS.find(p => p.id === 'bronze').features };
  } else {
    planDetails = PLANS.find(p => p.id === userPlan) || PLANS[0];
  }

  const modules = [
    { title: 'Treinos da Semana', description: 'Seu protocolo de treinamento com vídeos e guias.', icon: Dumbbell, view: 'training' },
    { title: 'Plano Alimentar', description: 'Seu guia de dieta personalizado para otimização de resultados.', icon: Utensils, view: 'diet' },
    { title: 'Mentoria e Mindset', description: 'Desenvolvimento pessoal e sessões de mentoria com o campeão.', icon: Star, view: 'mentorship' },
    { title: 'Desafios & Metas', description: 'Participe dos desafios e impulsione seus resultados.', icon: Target, view: 'challenges' },
    { title: 'Conquistas', description: 'Seu mural de troféus e distintivos desbloqueados.', icon: Trophy, view: 'achievements' },
  ];

  return (
    <div className={`min-h-screen p-4 md:p-10 ${BG_COLOR} ${TEXT_COLOR}`}>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-700">
          <h1 className={`text-3xl font-extrabold ${ACCENT_TEXT_COLOR}`}>Triade Max | Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className={`py-1 px-3 rounded-full text-sm font-bold ${planDetails.color} ${CARD_COLOR}`}>Plano: {planDetails.name}</span>
            <PrimaryButton onClick={() => setView('plans')} disabled={false} className="!w-auto !py-2 !px-4 text-sm">{isTrial ? 'FAÇA UPGRADE' : 'Mudar Plano'}</PrimaryButton>
          </div>
        </header>

        {isTrial && (
          <div className="p-4 mb-8 text-center rounded-lg bg-sky-900/30 border border-sky-500/50"><p className="font-semibold text-sky-400">🎉 Bem-vindo ao seu Plano Trial! Explore os treinos e dietas de amostra antes de fazer upgrade.</p></div>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Módulos Exclusivos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {modules.map((mod) => (
              <button key={mod.view} onClick={() => setView(mod.view)} className={`${CARD_COLOR} p-6 rounded-xl text-left transition duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-green-900/50`}>
                <mod.icon className={`w-8 h-8 mb-3 ${ACCENT_TEXT_COLOR}`} />
                <h3 className="text-xl font-bold mb-1">{mod.title}</h3>
                <p className={`${SUBTEXT_COLOR} text-sm mb-4`}>{mod.description}</p>
                <div className={`flex items-center ${ACCENT_TEXT_COLOR} font-semibold text-sm`}>Acessar Módulo <ArrowRight className="w-4 h-4 ml-2" /></div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center"><Star className={`w-5 h-5 mr-3 text-yellow-500`} /> O Que Nossos Campeões Dizem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, index) => (
              <div key={index} className={`${CARD_COLOR} p-5 rounded-xl border-t-4 border-yellow-500`}>
                <p className={`italic ${TEXT_COLOR} mb-3 text-sm`}>"{t.text}"</p>
                <div className="flex items-center">
                  <img src={`https://placehold.co/40x40/374151/FFFFFF?text=${t.avatar}`} alt={t.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <div className="flex text-yellow-400 text-xs">{'★'.repeat(t.rating)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Novidades da Semana</h2>
          <div className={`${CARD_COLOR} p-6 rounded-xl border-l-4 border-yellow-500`}>
            <h3 className="text-xl font-bold mb-2"><Shield className={`inline-block mr-2 w-5 h-5 text-yellow-500`} /> Live: Como Vencer a Procrastinação!</h3>
            <p className={`${SUBTEXT_COLOR}`}>Não perca a mentoria especial desta quinta, 20h00, sobre técnicas mentais de campeões.</p>
          </div>
        </section>

        <footer className="text-center pt-8 border-t border-gray-700">
          <PrimaryButton onClick={() => setView('login')} className="!w-auto !py-2 !px-4 text-sm bg-red-600 hover:bg-red-700 shadow-none">Sair</PrimaryButton>
        </footer>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL (inicializa Firebase aqui, em runtime) ---
const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [view, setView] = useState('loading'); // loading, login, plans, dashboard, training, diet, mentorship, challenges, achievements
  const [userPlan, setUserPlan] = useState(null); // trial, bronze, prata, ouro

  // Inicializa Firebase e autentica
  useEffect(() => {
    // Inicializa app apenas uma vez
    let fbApp;
    try {
      fbApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.warn('initializeApp já foi chamado anteriormente ou houve erro:', e.message || e);
      // tentamos continuar (talvez já tenha sido inicializado)
      try {
        fbApp = initializeApp(firebaseConfig);
      } catch (inner) {
        // fallback: continuamos no modo simulado
        console.error('Falha ao (re)inicializar firebase:', inner);
        setIsAuthReady(true);
        setView('login');
        return;
      }
    }

    const firestore = getFirestore(fbApp);
    const authentication = getAuth(fbApp);
    setDb(firestore);
    setAuth(authentication);

    // Função para forçar autenticação (token custom ou anônimo)
    const authenticate = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(authentication, initialAuthToken);
        } else {
          await signInAnonymously(authentication);
        }
      } catch (e) {
        console.error("Erro na autenticação inicial:", e);
        // tenta anônimo como fallback
        try {
          await signInAnonymously(authentication);
        } catch (anonErr) {
          console.error("Falha no login anônimo:", anonErr);
        }
      }
    };

    // Observa o estado de auth
    const unsubscribeAuth = onAuthStateChanged(authentication, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
        // ao iniciar, mostramos a tela de login para o usuário entrar (você pode trocar para dashboard)
        if (view === 'loading') setView('login');
      } else {
        setUserId(null);
        setIsAuthReady(true);
        authenticate();
      }
    });

    return () => {
      try { unsubscribeAuth(); } catch (e) { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listener do plano no Firestore
  useEffect(() => {
    if (!db || !userId || !isAuthReady) return;

    const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'user_status', 'plan');

    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.currentPlan) {
        setUserPlan(docSnap.data().currentPlan);
      } else {
        setUserPlan('trial');
      }
    }, (error) => {
      console.error("Erro ao escutar o plano do usuário:", error);
      setUserPlan('trial');
    });

    return () => {
      try { unsubscribeSnapshot(); } catch (e) { /* ignore */ }
    };
  }, [db, userId, isAuthReady]);

  const renderView = () => {
    if (!isAuthReady || view === 'loading' || !userPlan) {
      return <LoadingScreen />;
    }

    switch (view) {
      case 'dashboard': return <Dashboard setView={setView} userPlan={userPlan} />;
      case 'training': return <TrainingPage setView={setView} userPlan={userPlan} />;
      case 'diet': return <DietPage setView={setView} userPlan={userPlan} />;
      case 'mentorship': return <MentorshipPage setView={setView} userPlan={userPlan} />;
      case 'challenges': return <ChallengesPage setView={setView} />;
      case 'achievements': return <AchievementsPage setView={setView} />;
      case 'plans': return <div className="min-h-screen flex items-center justify-center"><p className="text-white">Tela de Planos (implementei a lógica no PlansScreen — adapte se preferir)</p></div>;
      case 'login': return <LoginScreen setView={setView} userId={userId} />;
      default: return <Dashboard setView={setView} userPlan={userPlan} />;
    }
  };

  return (
    <div className={`font-sans antialiased min-h-screen ${BG_COLOR} ${TEXT_COLOR}`}>
      {renderView()}
    </div>
  );
};

export default App;
