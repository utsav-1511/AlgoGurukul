import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { NavLink, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../Components/SubmissionHistory"
import ChatAi from '../Components/ChatAi';
import Editorial from '../Components/Editorial';
import { ArrowLeft, Bot, BookOpen, CheckCircle2, ClipboardList, Code2, FileText, Play, Send, Trophy } from 'lucide-react';

const langMap = {
        cpp: 'Cpp',
        java: 'Java',
        javascript: 'JavaScript',
        python:"Python3"
};

const normalizeLanguage = (language = '') => language.toLowerCase().replace(/[^a-z0-9]/g, '');

const languageAliases = {
  cpp: ['cpp', 'c'],
  java: ['java'],
  javascript: ['javascript', 'js'],
};

const getStartCodeForLanguage = (startCode = [], selectedLanguage = 'javascript') => {
  const aliases = languageAliases[selectedLanguage] || [selectedLanguage];
  return startCode.find((sc) => aliases.includes(normalizeLanguage(sc.language))) || startCode[0];
};

const getLanguageKey = (language = '') => {
  const normalized = normalizeLanguage(language);
  return Object.entries(languageAliases).find(([, aliases]) => aliases.includes(normalized))?.[0] || normalized;
};

const getLanguageLabel = (language) => langMap[language] || language;

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let {problemId}  = useParams();
  const { user } = useSelector((state) => state.auth);

  

  const { handleSubmit } = useForm();

 useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
       
        console.log("hello")
        const startCode = response.data.startCode || [];
        const selectedStartCode = getStartCodeForLanguage(startCode, selectedLanguage);
        const nextLanguage = getLanguageKey(selectedStartCode?.language || selectedLanguage);

        setProblem(response.data);
        setSelectedLanguage(nextLanguage);
        setCode(selectedStartCode?.initialCode || '');
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const selectedStartCode = getStartCodeForLanguage(problem.startCode, selectedLanguage);
      setCode(selectedStartCode?.initialCode || '');
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/runCode/${problemId}`, {
        code,
        language: selectedLanguage,
      });

      setRunResult(response.data);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: error?.response?.data?.error || error?.message || 'Internal server error',
        testCases: [],
      });
      setActiveRightTab('testcase');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code:code,
        language: selectedLanguage
      });

       setSubmitResult(response.data);
       console.log(response.data);
       setLoading(false);
       setActiveRightTab('result');
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
  switch (lang) {
    case "javascript":
      return "javascript";
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    case "python":
      return "python";
    default:
      return "javascript";
  }
};

  const getDifficultyBadgeColor = (difficulty = '') => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#121210] text-zinc-100">
      <div className="flex h-14 items-center justify-between border-b-2 border-zinc-700 bg-[#2d2d2a] px-4 backdrop-blur">
        <NavLink to="/" className="btn btn-ghost btn-sm gap-2 text-zinc-100 hover:bg-zinc-800">
          <ArrowLeft size={18} />
          Problems
        </NavLink>
        <div className="min-w-0 text-center">
          <div className="truncate text-sm font-semibold text-zinc-100">{problem?.title || 'Problem'}</div>
          {problem && (
            <div className="mt-1 flex justify-center gap-2">
              <span className={`badge badge-xs ${getDifficultyBadgeColor(problem.difficulty)}`}>{problem.difficulty}</span>
              <span className="badge badge-xs badge-outline">{problem.tags}</span>
            </div>
          )}
        </div>
        <div className="w-24" />
      </div>

      <div className="flex min-h-0 flex-1 gap-3 bg-[#121210] p-3">
      {/* Left Panel */}
      <div className="workspace-panel flex w-1/2 flex-col overflow-hidden rounded-lg border border-zinc-700 bg-[#242421] text-zinc-100">
        {/* Left Tabs */}
        <div className="tabs bg-[#242421] px-3 pt-2">
          <button 
            className={`tab gap-2 text-zinc-300 ${activeLeftTab === 'description' ? 'tab-active font-semibold text-indigo-400' : ''}`}
            onClick={() => setActiveLeftTab('description')}
          >
            <FileText size={16} />
            Description
          </button>
          <button 
            className={`tab gap-2 text-zinc-300 ${activeLeftTab === 'editorial' ? 'tab-active font-semibold text-indigo-400' : ''}`}
            onClick={() => setActiveLeftTab('editorial')}
          >
            <BookOpen size={16} />
            Editorial
          </button>
          <button 
            className={`tab gap-2 text-zinc-300 ${activeLeftTab === 'solutions' ? 'tab-active font-semibold text-indigo-400' : ''}`}
            onClick={() => setActiveLeftTab('solutions')}
          >
            <Code2 size={16} />
            Solutions
          </button>
          <button 
            className={`tab gap-2 text-zinc-300 ${activeLeftTab === 'submissions' ? 'tab-active font-semibold text-indigo-400' : ''}`}
            onClick={() => setActiveLeftTab('submissions')}
          >
            <ClipboardList size={16} />
            Submissions
          </button>

          <button 
            className={`tab gap-2 text-zinc-300 ${activeLeftTab === 'chatAI' ? 'tab-active font-semibold text-indigo-400' : ''}`}
            onClick={() => setActiveLeftTab('chatAI')}
          >
            <Bot size={16} />
            ChatAI
          </button>


        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </div>
                    <div className="badge badge-outline">{problem.tags}</div>
                  </div>

                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-7 text-base-content/85">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">Examples</h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="rounded-lg border border-base-300 bg-base-200/70 p-4">
                          <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Input:</strong> {example.input}</div>
                            <div><strong>Output:</strong> {example.output}</div>
                            <div><strong>Explaination:</strong> {example.explaination}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="border border-base-300 rounded-lg">
                        <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                          <h3 className="font-semibold">{problem?.title} - {solution?.language}</h3>
                        </div>
                        <div className="p-4">
                          <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                  <div className="text-gray-500">
                    {user?._id ? (
                      <SubmissionHistory problemId={problemId} />
                    ) : (
                      <p>Login to view your submissions.</p>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">CHAT with AI</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ChatAi problem={problem} editorRef={editorRef}></ChatAi>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="workspace-panel flex w-1/2 flex-col overflow-hidden rounded-lg border">
        {/* Right Tabs */}
        <div className="tabs bg-base-100 px-3 pt-2">
          <button 
            className={`tab gap-2 ${activeRightTab === 'code' ? 'tab-active font-semibold text-primary' : ''}`}
            onClick={() => setActiveRightTab('code')}
          >
            <Code2 size={16} />
            Code
          </button>
          <button 
            className={`tab gap-2 ${activeRightTab === 'testcase' ? 'tab-active font-semibold text-primary' : ''}`}
            onClick={() => setActiveRightTab('testcase')}
          >
            <ClipboardList size={16} />
            Testcase
          </button>
          <button 
            className={`tab gap-2 ${activeRightTab === 'result' ? 'tab-active font-semibold text-primary' : ''}`}
            onClick={() => setActiveRightTab('result')}
          >
            <Trophy size={16} />
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex items-center justify-between border-b border-base-300 bg-base-200/60 p-3">
                <div className="flex gap-2">
                  {(problem?.startCode?.length ? problem.startCode.map((sc) => getLanguageKey(sc.language)) : ['javascript', 'java', 'cpp']).map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {getLanguageLabel(lang)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between border-t border-base-300 bg-base-100 p-3">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-outline btn-sm gap-2 ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    <Play size={16} />
                    Run
                  </button>
                  <button
                    className={`btn btn-primary btn-sm gap-2 ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    <Send size={16} />
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              {runResult ? (
                <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'} mb-4`}>
                  <div>
                    {runResult.success ? (
                      <div>
                        <h4 className="flex items-center gap-2 font-bold"><CheckCircle2 size={18} />All test cases passed</h4>
                        <p className="text-sm mt-2">Runtime: {runResult.runtime+" sec"}</p>
                        <p className="text-sm">Memory: {runResult.memory+" KB"}</p>
                        
                        <div className="mt-4 space-y-2">
                          {(runResult.testCases || []).map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                <div className={'text-green-600'}>
                                  Passed
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold">Error</h4>
                        {runResult?.error && <p className="text-sm mt-2">{runResult.error}</p>}
                        <div className="mt-4 space-y-2">
                          {(runResult.testCases || []).map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                {(tc.stderr || tc.compile_output || tc.message) && (
                                  <div><strong>Error:</strong> {tc.stderr || tc.compile_output || tc.message}</div>
                                )}
                                <div className={tc.status_id==3 ? 'text-green-600' : 'text-red-600'}>
                                  {tc.status?.description || (tc.status_id==3 ? 'Passed' : 'Failed')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {submitResult ? (
                <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-lg">Accepted</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.testCasesPassed}/{submitResult.testCasesTotal}</p>
                          <p>Runtime: {submitResult.runtime + " sec"}</p>
                          <p>Memory: {submitResult.memory + "KB"} </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg">{submitResult.errorMessage || 'Rejected'}</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.testCasesPassed}/{submitResult.testCasesTotal}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProblemPage;
// export editorRef;
