import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DASH_QUESTIONS = [
  {
    id: 1,
    question: "Open a tight or new jar.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 2,
    question: "Write.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 3,
    question: "Turn a key.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 4,
    question: "Prepare a meal.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 5,
    question: "Push open a heavy door.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 6,
    question: "Place an object on a shelf above your head.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 7,
    question: "Do heavy household chores (e.g., wash walls, wash floors).",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 8,
    question: "Garden or do yard work.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 9,
    question: "Make a bed.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 10,
    question: "Carry a shopping bag or briefcase.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 11,
    question: "Carry a heavy object (over 10 lbs).",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 12,
    question: "Change a lightbulb overhead.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 13,
    question: "Wash or blow dry your hair.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 14,
    question: "Wash your back.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 15,
    question: "Put on a pullover sweater.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 16,
    question: "Use a knife to cut food.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 17,
    question: "Recreational activities which require little effort (e.g., cardplaying, knitting, etc.).",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 18,
    question: "Recreational activities in which you take some force or impact through your arm, shoulder or hand (e.g., golf, hammering, tennis, etc.).",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 19,
    question: "Recreational activities in which you move your arm freely (e.g., playing frisbee, badminton, etc.).",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 20,
    question: "Manage transportation needs (getting from one place to another).",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 21,
    question: "Sexual activities.",
    category: "Physical Function",
    responseType: "difficulty"
  },
  {
    id: 22,
    question: "During the past week, to what extent has your arm, shoulder or hand problem interfered with your normal social activities with family, friends, neighbours or groups?",
    category: "Social Function",
    responseType: "interference"
  },
  {
    id: 23,
    question: "During the past week, were you limited in your work or other regular daily activities as a result of your arm, shoulder or hand problem?",
    category: "Role Function",
    responseType: "limitation"
  },
  {
    id: 24,
    question: "Arm, shoulder or hand pain.",
    category: "Symptoms",
    responseType: "severity"
  },
  {
    id: 25,
    question: "Arm, shoulder or hand pain when you performed any specific activity.",
    category: "Symptoms",
    responseType: "severity"
  },
  {
    id: 26,
    question: "Tingling (pins and needles) in your arm, shoulder or hand.",
    category: "Symptoms",
    responseType: "severity"
  },
  {
    id: 27,
    question: "Weakness in your arm, shoulder or hand.",
    category: "Symptoms",
    responseType: "severity"
  },
  {
    id: 28,
    question: "Stiffness in your arm, shoulder or hand.",
    category: "Symptoms",
    responseType: "severity"
  },
  {
    id: 29,
    question: "During the past week, how much difficulty have you had sleeping because of the pain in your arm, shoulder or hand?",
    category: "Sleep Impact",
    responseType: "sleep"
  },
  {
    id: 30,
    question: "I feel less capable, less confident or less useful because of my arm, shoulder or hand problem.",
    category: "Self-Perception",
    responseType: "agreement"
  }
];

// Official DASH response options for different question types
const RESPONSE_OPTIONS = {
  difficulty: [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" }
  ],
  interference: [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" }
  ],
  limitation: [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" }
  ],
  severity: [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" }
  ],
  sleep: [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" }
  ],
  agreement: [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" }
  ]
};

interface DashAssessmentProps {
  onComplete: (responses: Record<number, number>, dashScore: number) => void;
  onCancel: () => void;
}

export default function DashAssessment({ onComplete, onCancel }: DashAssessmentProps) {
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const { toast } = useToast();

  const handleResponseChange = (questionId: number, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateDashScore = (responses: Record<number, number>) => {
    const validResponses = Object.values(responses).filter(value => value > 0);
    const missingQuestions = 30 - validResponses.length;
    
    // DASH score cannot be calculated if more than 3 items are missing
    if (missingQuestions > 3) {
      return null;
    }
    
    if (validResponses.length === 0) return null;
    
    // Official DASH formula: [(sum of n responses) - n] × 25 / n
    const sum = validResponses.reduce((acc, value) => acc + value, 0);
    const n = validResponses.length;
    const dashScore = ((sum - n) * 25) / n;
    return Math.round(dashScore * 10) / 10; // Round to 1 decimal place
  };

  const handleNext = () => {
    if (!responses[currentQuestion]) {
      toast({
        title: "Response Required",
        description: "Please select a response before continuing.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentQuestion < 30) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = () => {
    const answeredQuestions = Object.keys(responses).length;
    if (answeredQuestions < 27) {
      toast({
        title: "Incomplete Assessment",
        description: `Please answer at least 27 questions. You have answered ${answeredQuestions}/30.`,
        variant: "destructive"
      });
      return;
    }

    const dashScore = calculateDashScore(responses);
    if (dashScore !== null) {
      onComplete(responses, dashScore);
    }
  };

  const progress = (Object.keys(responses).length / 30) * 100;
  const currentQ = DASH_QUESTIONS[currentQuestion - 1];
  const answeredQuestions = Object.keys(responses).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center justify-center">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-xl font-bold">DISABILITIES OF THE ARM, SHOULDER AND HAND</div>
              <div className="text-lg">THE DASH</div>
              <div className="text-base font-normal">Question {currentQuestion} of 30</div>
            </div>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress: {answeredQuestions}/30 questions completed</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentQuestion === 1 && (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
              <h3 className="text-lg font-bold text-center text-gray-900 mb-4">INSTRUCTIONS</h3>
              <div className="text-sm text-gray-800 space-y-3">
                <p>This questionnaire asks about your symptoms as well as your ability to perform certain activities.</p>
                <p><strong>Please answer every question</strong>, based on your condition in the last week, by selecting the appropriate response.</p>
                <p>If you did not have the opportunity to perform an activity in the past week, please make your best estimate on which response would be the most accurate.</p>
                <p>It doesn't matter which hand or arm you use to perform the activity; please answer based on your ability regardless of how you perform the task.</p>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">
              {currentQ.category}
            </div>
            <div className="text-lg font-medium text-gray-900">
              {currentQ.id <= 21 ? (
                <>Please rate your ability to do the following activity in the last week:<br />
                <span className="font-semibold">{currentQ.id}. {currentQ.question}</span></>
              ) : currentQ.id <= 23 ? (
                <span className="font-semibold">{currentQ.id}. {currentQ.question}</span>
              ) : currentQ.id <= 28 ? (
                <>Please rate the severity of the following symptom in the last week:<br />
                <span className="font-semibold">{currentQ.id}. {currentQ.question}</span></>
              ) : (
                <span className="font-semibold">{currentQ.id}. {currentQ.question}</span>
              )}
            </div>
          </div>

          {/* Response Scale Labels */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-center mb-3">
              {currentQ.responseType === 'difficulty' && 'Please circle the number below the appropriate response:'}
              {currentQ.responseType === 'interference' && 'Please circle the number below the appropriate response:'}
              {currentQ.responseType === 'limitation' && 'Please circle the number below the appropriate response:'}
              {currentQ.responseType === 'severity' && 'Please circle the number below the appropriate response:'}
              {currentQ.responseType === 'sleep' && 'Please circle the number below the appropriate response:'}
              {currentQ.responseType === 'agreement' && 'Please circle the number below the appropriate response:'}
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs text-center font-medium mb-2">
              {currentQ.responseType === 'difficulty' && (
                <>
                  <div>NO<br/>DIFFICULTY</div>
                  <div>MILD<br/>DIFFICULTY</div>
                  <div>MODERATE<br/>DIFFICULTY</div>
                  <div>SEVERE<br/>DIFFICULTY</div>
                  <div>UNABLE</div>
                </>
              )}
              {currentQ.responseType === 'interference' && (
                <>
                  <div>NOT AT ALL</div>
                  <div>SLIGHTLY</div>
                  <div>MODERATELY</div>
                  <div>QUITE<br/>A BIT</div>
                  <div>EXTREMELY</div>
                </>
              )}
              {currentQ.responseType === 'limitation' && (
                <>
                  <div>NOT LIMITED<br/>AT ALL</div>
                  <div>SLIGHTLY<br/>LIMITED</div>
                  <div>MODERATELY<br/>LIMITED</div>
                  <div>VERY<br/>LIMITED</div>
                  <div>UNABLE</div>
                </>
              )}
              {currentQ.responseType === 'severity' && (
                <>
                  <div>NONE</div>
                  <div>MILD</div>
                  <div>MODERATE</div>
                  <div>SEVERE</div>
                  <div>EXTREME</div>
                </>
              )}
              {currentQ.responseType === 'sleep' && (
                <>
                  <div>NO<br/>DIFFICULTY</div>
                  <div>MILD<br/>DIFFICULTY</div>
                  <div>MODERATE<br/>DIFFICULTY</div>
                  <div>SEVERE<br/>DIFFICULTY</div>
                  <div>SO MUCH DIFFICULTY<br/>THAT I CAN'T SLEEP</div>
                </>
              )}
              {currentQ.responseType === 'agreement' && (
                <>
                  <div>STRONGLY<br/>DISAGREE</div>
                  <div>DISAGREE</div>
                  <div>NEITHER AGREE<br/>NOR DISAGREE</div>
                  <div>AGREE</div>
                  <div>STRONGLY<br/>AGREE</div>
                </>
              )}
            </div>
          </div>

          <RadioGroup
            value={responses[currentQuestion]?.toString() || ""}
            onValueChange={(value) => handleResponseChange(currentQuestion, parseInt(value))}
            className="mt-4"
          >
            <div className="grid grid-cols-5 gap-4">
              {(RESPONSE_OPTIONS[currentQ.responseType as keyof typeof RESPONSE_OPTIONS] || RESPONSE_OPTIONS.difficulty).map((option) => (
                <div key={option.value} className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 border-2 rounded-full hover:bg-gray-50">
                    <RadioGroupItem 
                      value={option.value.toString()} 
                      id={`option-${option.value}`}
                      className="w-6 h-6"
                    />
                  </div>
                  <Label 
                    htmlFor={`option-${option.value}`} 
                    className="text-lg font-bold text-center cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Cancel Assessment
              </Button>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 1}
              >
                Previous
              </Button>
            </div>

            <div className="flex gap-2">
              {currentQuestion < 30 && (
                <Button onClick={handleNext}>
                  Next Question
                </Button>
              )}
              {currentQuestion === 30 && (
                <Button 
                  onClick={handleComplete}
                  disabled={answeredQuestions < 27}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Assessment
                </Button>
              )}
            </div>
          </div>

          {answeredQuestions >= 27 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-green-800 text-sm">
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
                You have answered enough questions to complete the assessment.
                {answeredQuestions < 30 && " You can continue answering or complete now."}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}