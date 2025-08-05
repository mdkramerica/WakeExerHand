import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileText, ArrowRight } from 'lucide-react';

const dashSchema = z.object({
  q1_open_jar: z.number().min(1).max(5),
  q2_write: z.number().min(1).max(5),
  q3_turn_key: z.number().min(1).max(5),
  q4_prepare_meal: z.number().min(1).max(5),
  q5_push_heavy_door: z.number().min(1).max(5),
  q6_place_object_shelf: z.number().min(1).max(5),
  q7_heavy_household_chores: z.number().min(1).max(5),
  q8_garden_yard_work: z.number().min(1).max(5),
  q9_make_bed: z.number().min(1).max(5),
  q10_carry_shopping_bag: z.number().min(1).max(5),
  q11_carry_heavy_object: z.number().min(1).max(5),
  q12_change_lightbulb: z.number().min(1).max(5),
  q13_wash_blow_dry_hair: z.number().min(1).max(5),
  q14_wash_back: z.number().min(1).max(5),
  q15_put_on_sweater: z.number().min(1).max(5),
  q16_use_knife_cut_food: z.number().min(1).max(5),
  q17_recreational_little_effort: z.number().min(1).max(5),
  q18_recreational_force_impact: z.number().min(1).max(5),
  q19_recreational_move_arm_freely: z.number().min(1).max(5),
  q20_manage_transportation: z.number().min(1).max(5),
  q21_sexual_activities: z.number().min(1).max(5),
  q22_social_activities_interference: z.number().min(1).max(5),
  q23_work_limitation: z.number().min(1).max(5),
  q24_arm_shoulder_hand_pain: z.number().min(1).max(5),
  q25_pain_specific_activity: z.number().min(1).max(5),
  q26_tingling: z.number().min(1).max(5),
  q27_weakness: z.number().min(1).max(5),
  q28_stiffness: z.number().min(1).max(5),
  q29_difficulty_sleeping: z.number().min(1).max(5),
  q30_feel_less_capable: z.number().min(1).max(5),
});

type DashData = z.infer<typeof dashSchema>;

interface DashQuestionnaireProps {
  onSubmit: (responses: DashData) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

const dashQuestions = [
  // Questions 1-21: Physical Function - NO DIFFICULTY to UNABLE scale
  {
    id: 'q1_open_jar',
    text: 'Open a tight or new jar.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q2_write',
    text: 'Write.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q3_turn_key',
    text: 'Turn a key.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q4_prepare_meal',
    text: 'Prepare a meal.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q5_push_heavy_door',
    text: 'Push open a heavy door.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q6_place_object_shelf',
    text: 'Place an object on a shelf above your head.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q7_heavy_household_chores',
    text: 'Do heavy household chores (e.g., wash walls, wash floors).',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q8_garden_yard_work',
    text: 'Garden or do yard work.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q9_make_bed',
    text: 'Make a bed.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q10_carry_shopping_bag',
    text: 'Carry a shopping bag or briefcase.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q11_carry_heavy_object',
    text: 'Carry a heavy object (over 10 lbs).',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q12_change_lightbulb',
    text: 'Change a lightbulb overhead.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q13_wash_blow_dry_hair',
    text: 'Wash or blow dry your hair.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q14_wash_back',
    text: 'Wash your back.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q15_put_on_sweater',
    text: 'Put on a pullover sweater.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q16_use_knife_cut_food',
    text: 'Use a knife to cut food.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q17_recreational_little_effort',
    text: 'Recreational activities which require little effort (e.g., cardplaying, knitting, etc.).',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q18_recreational_force_impact',
    text: 'Recreational activities in which you take some force or impact through your arm, shoulder or hand (e.g., golf, hammering, tennis, etc.).',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q19_recreational_move_arm_freely',
    text: 'Recreational activities in which you move your arm freely (e.g., playing frisbee, badminton, etc.).',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q20_manage_transportation',
    text: 'Manage transportation needs (getting from one place to another).',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  {
    id: 'q21_sexual_activities',
    text: 'Sexual activities.',
    category: 'Physical Function',
    responseType: 'difficulty'
  },
  // Question 22: Social Function - NOT AT ALL to EXTREMELY scale
  {
    id: 'q22_social_activities_interference',
    text: 'During the past week, to what extent has your arm, shoulder or hand problem interfered with your normal social activities with family, friends, neighbours or groups?',
    category: 'Social Function',
    responseType: 'interference'
  },
  // Question 23: Role Function - NOT LIMITED AT ALL to UNABLE scale
  {
    id: 'q23_work_limitation',
    text: 'During the past week, were you limited in your work or other regular daily activities as a result of your arm, shoulder or hand problem?',
    category: 'Role Function',
    responseType: 'limitation'
  },
  // Questions 24-28: Symptoms - NONE to EXTREME scale
  {
    id: 'q24_arm_shoulder_hand_pain',
    text: 'Arm, shoulder or hand pain.',
    category: 'Symptoms',
    responseType: 'severity'
  },
  {
    id: 'q25_pain_specific_activity',
    text: 'Arm, shoulder or hand pain when you performed any specific activity.',
    category: 'Symptoms',
    responseType: 'severity'
  },
  {
    id: 'q26_tingling',
    text: 'Tingling (pins and needles) in your arm, shoulder or hand.',
    category: 'Symptoms',
    responseType: 'severity'
  },
  {
    id: 'q27_weakness',
    text: 'Weakness in your arm, shoulder or hand.',
    category: 'Symptoms',
    responseType: 'severity'
  },
  {
    id: 'q28_stiffness',
    text: 'Stiffness in your arm, shoulder or hand.',
    category: 'Symptoms',
    responseType: 'severity'
  },
  // Question 29: Sleep - NO DIFFICULTY to SO MUCH DIFFICULTY scale
  {
    id: 'q29_difficulty_sleeping',
    text: 'During the past week, how much difficulty have you had sleeping because of the pain in your arm, shoulder or hand?',
    category: 'Sleep Impact',
    responseType: 'sleep'
  },
  // Question 30: Self-perception - STRONGLY DISAGREE to STRONGLY AGREE scale
  {
    id: 'q30_feel_less_capable',
    text: 'I feel less capable, less confident or less useful because of my arm, shoulder or hand problem.',
    category: 'Self-Perception',
    responseType: 'agreement'
  },
];

// Different response options for different question types
const responseOptions = {
  difficulty: [
    { value: 1, label: 'No Difficulty' },
    { value: 2, label: 'Mild Difficulty' },
    { value: 3, label: 'Moderate Difficulty' },
    { value: 4, label: 'Severe Difficulty' },
    { value: 5, label: 'Unable' },
  ],
  interference: [
    { value: 1, label: 'Not at all' },
    { value: 2, label: 'Slightly' },
    { value: 3, label: 'Moderately' },
    { value: 4, label: 'Quite a bit' },
    { value: 5, label: 'Extremely' },
  ],
  limitation: [
    { value: 1, label: 'Not limited at all' },
    { value: 2, label: 'Slightly limited' },
    { value: 3, label: 'Moderately limited' },
    { value: 4, label: 'Very limited' },
    { value: 5, label: 'Unable' },
  ],
  severity: [
    { value: 1, label: 'None' },
    { value: 2, label: 'Mild' },
    { value: 3, label: 'Moderate' },
    { value: 4, label: 'Severe' },
    { value: 5, label: 'Extreme' },
  ],
  sleep: [
    { value: 1, label: 'No difficulty' },
    { value: 2, label: 'Mild difficulty' },
    { value: 3, label: 'Moderate difficulty' },
    { value: 4, label: 'Severe difficulty' },
    { value: 5, label: "So much difficulty that I can't sleep" },
  ],
  agreement: [
    { value: 1, label: 'Strongly disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neither agree nor disagree' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly agree' },
  ],
};

export default function DashQuestionnaire({ onSubmit, onSkip, isLoading }: DashQuestionnaireProps) {
  const form = useForm<DashData>({
    resolver: zodResolver(dashSchema),
  });

  const handleSubmit = (data: DashData) => {
    onSubmit(data);
  };

  const calculateScore = () => {
    const values = form.getValues();
    const scores = Object.values(values).filter(v => typeof v === 'number');
    
    // DASH score cannot be calculated if more than 3 items are missing
    const totalQuestions = 30;
    const answeredQuestions = scores.length;
    const missingQuestions = totalQuestions - answeredQuestions;
    
    if (missingQuestions > 3) {
      return null; // Cannot calculate score
    }
    
    if (answeredQuestions === 0) return 0;
    
    // Official DASH formula: [(sum of n responses) - 1] × 25 / n
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return ((sum - answeredQuestions) * 25) / answeredQuestions;
  };

  const currentScore = calculateScore();

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>QuickDASH Questionnaire</span>
        </CardTitle>
        <CardDescription>
          Please rate your ability to do the following activities in the last week. (11 questions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            
            {/* Score Display */}
            {currentScore > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Current QuickDASH Score</div>
                <div className="text-2xl font-bold">{currentScore.toFixed(1)}/100</div>
                <div className="text-sm text-muted-foreground">
                  {currentScore <= 25 ? 'Minimal disability' : 
                   currentScore <= 50 ? 'Mild disability' :
                   currentScore <= 75 ? 'Moderate disability' : 'Severe disability'}
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((question, index) => (
                <FormField
                  key={question.id}
                  control={form.control}
                  name={question.id as keyof QuickDashData}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <div>{question.text}</div>
                            <div className="text-sm text-muted-foreground font-normal mt-1">
                              {question.category}
                            </div>
                          </div>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          className="grid grid-cols-1 md:grid-cols-5 gap-2 ml-11"
                        >
                          {responseOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={option.value.toString()} 
                                id={`${question.id}-${option.value}`}
                              />
                              <Label 
                                htmlFor={`${question.id}-${option.value}`}
                                className="text-sm leading-tight cursor-pointer"
                              >
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <span>{isLoading ? 'Saving...' : 'Save QuickDASH Responses'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={onSkip}
                disabled={isLoading}
              >
                Skip Questionnaire
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}