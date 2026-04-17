export type ManualSubItem = {
  label: string;
  text: string;
};

export type ManualSubSection = {
  id: string;
  title: string;
  body: string;
  items?: ManualSubItem[];
  debuggingQuestion?: string;
};

export type ManualPageSection = {
  id: string;
  navLabel: string;
  title: string;
  intro: string;
  subSections?: ManualSubSection[];
};

export const MANUAL_HEADER = {
  title: 'Bluebird Technical Manual',
  subtitle: '인지 운영 체제와 자율성 탈환을 위한 정밀 지침서',
} as const;

export const MANUAL_PREFACE = {
  id: 'preface',
  navLabel: '서문',
  paragraphs: [
    '인간의 정신은 수만 년에 걸친 진화의 결과물이지만, 우리의 하드웨어는 현대 사회가 요구하는 복잡한 정보 처리 능력을 갖추도록 설계되지 않았습니다. 인류의 조상들이 초원에서 포식자를 피하기 위해 발달시킨 즉각적이고 생존 지향적인 사고 체계는, 오늘날의 복잡한 인간관계와 비즈니스 환경에서는 오히려 불안과 인지적 왜곡을 양산하는 원인이 됩니다.',
    'Project Bluebird는 당신의 정신을 치료의 대상이 아닌, 최적화의 대상으로 간주합니다. 우리가 겪는 대부분의 심리적 고통은 외부 환경의 부조리가 아니라, 내부 데이터 처리 장치에서 발생하는 시스템 오류(Systemic Error)에서 기인합니다. 이 매뉴얼을 통해 당신은 자신의 사고 과정을 객관화하고, 시스템의 주도권을 시스템 1(직관)에서 시스템 2(분석)로 탈환하는 법을 학습하게 될 것입니다.',
  ],
} as const;

export const MANUAL_SECTIONS: ManualPageSection[] = [
  {
    id: 'core-01',
    navLabel: '이중 프로세스 이론',
    title: '1. 사고 아키텍처: 이중 프로세스 이론 (Dual Process Theory)',
    intro:
      '다니엘 카너먼이 정의한 이중 프로세스 이론은 우리가 세상을 인식하고 판단하는 두 가지 근본적인 경로를 설명합니다. 이 두 시스템의 상호작용과 갈등을 이해하는 것이 인지 디버깅의 핵심입니다.',
    subSections: [
      {
        id: 'core-01-s1',
        title: '1.1 시스템 1 (The Automatic Pilot)',
        body: '시스템 1은 우리가 의식하지 않아도 24시간 백그라운드에서 작동하는 자동 조종 장치입니다. 이는 직관적이고, 즉각적이며, 감정 중심적이고, 무엇보다 인지적 에너지를 거의 소모하지 않습니다.',
        items: [
          { label: '작동 원리', text: '연상 기억을 활용하여 패턴을 신속하게 인식합니다.' },
          { label: '장점', text: '긴급 상황에서 생존 가능성을 높이며, 일상적인 단순 반복 작업을 효율적으로 처리합니다.' },
          { label: '단점', text: '통계적 사고에 취약하며, 논리적 인과관계보다 일관성 있는 이야기를 선호하여 인지 왜곡을 빈번하게 생성합니다.' },
          { label: 'Bluebird 분석', text: '당신이 느끼는 근거 없는 공포와 즉각적인 자기 비난은 시스템 1이 불완전한 데이터를 바탕으로 내린 성급한 결론입니다.' },
        ],
      },
      {
        id: 'core-01-s2',
        title: '1.2 시스템 2 (The Rational Captain)',
        body: '시스템 2는 의도적인 주의 집중과 노력을 기울여야만 활성화되는 분석적 제어기입니다. 논리적 추론, 복잡한 계산, 통계적 판단을 담당합니다.',
        items: [
          { label: '작동 원리', text: '규칙 기반의 직렬 처리를 통해 정보를 분석합니다.' },
          { label: '장점', text: '시스템 1의 직관적 오류를 모니터링하고 수정할 수 있는 유일한 도구입니다.' },
          { label: '단점', text: '작동 속도가 느리고, 막대한 정신적 에너지(포도당)를 소모합니다. 뇌는 본능적으로 에너지를 아끼려 하기 때문에 시스템 2를 최대한 끄고 있으려 합니다 (Cognitive Miser: 인지적 구두쇠).' },
          { label: 'Bluebird 분석', text: '우리의 모든 개입은 시스템 1의 자동적 루프를 차단(Circuit Breaking)하고, 잠들어 있는 시스템 2를 강제로 기동시켜 데이터의 무결성을 검토하게 하는 데 목적이 있습니다.' },
        ],
      },
    ],
  },
  {
    id: 'dyn-02',
    navLabel: '전망이론',
    title: '2. 의사결정의 수학적 모델: 전망이론 (Prospect Theory)',
    intro:
      '우리가 왜 특정한 상황에서 비합리적으로 고통스러워하는지, 그리고 왜 낮은 확률의 불행에 집착하는지는 전망이론을 통해 수학적으로 설명될 수 있습니다.',
    subSections: [
      {
        id: 'dyn-02-s1',
        title: '2.1 준거점 의존성 (Reference Point Dependence)',
        body: '인간의 가치 판단은 절대적인 수치가 아니라 주관적으로 설정된 기준점, 즉 준거점을 중심으로 이루어집니다.',
        items: [
          { label: '고통의 원천', text: '당신이 현재 불행하다고 느끼는 이유는 객관적인 상황이 나빠서가 아니라, 당신의 준거점이 비현실적으로 높은 곳(완벽한 나, 타인과의 비교, 과거의 영광)에 고착되어 있기 때문입니다.' },
          { label: '디버깅 전략', text: 'Bluebird는 당신이 무의식적으로 설정한 준거점을 찾아내어 이를 현재의 데이터에 기반한 합리적 위치로 재조정(Re-anchoring)합니다.' },
        ],
      },
      {
        id: 'dyn-02-s2',
        title: '2.2 손실 회피 (Loss Aversion)',
        body: '인간은 이득에서 얻는 기쁨보다 손실에서 느끼는 고통을 약 2.25배 더 강력하게 인지합니다.',
        items: [
          { label: '시스템 오류', text: '이러한 비대칭성 때문에 우리는 작은 부정적인 신호에도 과도하게 민감하게 반응하며, 이는 파국화(Catastrophizing)의 강력한 엔진이 됩니다.' },
          { label: '시각화 지표', text: '가치 함수 곡선에서 당신의 심리적 위치가 얼마나 가파른 손실 영역에 위치해 있는지 시각화함으로써, 당신이 느끼는 고통이 실제 손실 규모보다 과장되어 있음을 증명합니다.' },
        ],
      },
      {
        id: 'dyn-02-s3',
        title: '2.3 확률 가중치와 파국화 (Probability Weighting)',
        body: '인간의 뇌는 객관적 확률을 있는 그대로 받아들이지 못하고 주관적으로 왜곡합니다. 특히 발생 가능성이 매우 낮은 극단적인 부정적 사건에 과도한 가중치를 부여합니다.',
        items: [
          { label: '파국화의 메커니즘', text: '시스템 1은 0.01%의 위험을 마치 50%의 위험처럼 인식하여 공포 신호를 보냅니다.' },
          { label: '데이터 보정', text: 'Bluebird는 당신의 주관적 확률을 베이지안 업데이트(Bayesian Update)와 객관적 통계 데이터(Base Rate)를 통해 재보정하여, 당신의 불안이 통계적으로 얼마나 타당하지 않은지 증명합니다.' },
        ],
      },
    ],
  },
  {
    id: 'dbug-03',
    navLabel: '인지 오류 Taxonomy',
    title: '3. 인지 오류 Taxonomy: 시스템 에러 디버깅',
    intro:
      '당신의 사고 로그에서 반복적으로 나타나는 주요 소프트웨어 에러들을 정의합니다. 에러에 이름을 붙이는 행위 자체가 이미 시스템 2의 개입을 시작하는 것입니다.',
    subSections: [
      {
        id: 'dbug-03-s1',
        title: '3.1 휴리스틱 (Heuristics): 정신적 지름길의 함정',
        body: '복잡한 판단을 신속하게 내리기 위해 뇌가 사용하는 지름길입니다.',
        items: [
          { label: '가용성 휴리스틱', text: '최근에 본 뉴스나 강렬한 기억(예: 한 번의 실패)을 바탕으로 전체 확률을 판단하는 오류입니다.' },
          { label: '대표성 휴리스틱', text: '특정 유형의 전형적인 모습과 비슷하다는 이유만으로 인과관계를 단정 짓는 오류입니다.' },
        ],
      },
      {
        id: 'dbug-03-s2',
        title: '3.2 파국화 (Catastrophizing): 최악이라는 시나리오 에러',
        body: '작은 부정적 단서를 바탕으로 최악의 파멸적인 결론으로 논리적 비약을 하는 상태입니다.',
        items: [
          { label: '분석', text: '시스템 1이 미래의 불확실성을 감당하지 못해, 가장 자극적인 손실 시나리오를 확정적 사실로 처리하는 오류입니다.' },
        ],
        debuggingQuestion: '"이 사건이 파멸로 이어지기 위해 필요한 중간 단계들의 객관적 확률은 각각 얼마인가?"',
      },
      {
        id: 'dbug-03-s3',
        title: '3.3 흑백논리 (Dichotomous Thinking): 데이터 이진화 에러',
        body: '현실의 복잡한 스펙트럼을 무시하고 성공 아니면 실패, 내 편 아니면 적이라는 두 가지 카테고리로만 분류하는 오류입니다.',
        items: [
          { label: '분석', text: '중간 지대의 유의미한 성취 데이터를 무시함으로써 심리적 엔트로피를 높이고 자아 존중감을 고갈시킵니다.' },
        ],
        debuggingQuestion: '"성공과 실패 사이의 회색 지대에 존재하는 데이터 3가지는 무엇인가?"',
      },
      {
        id: 'dbug-03-s4',
        title: '3.4 감정적 추론 (Emotional Reasoning): 데이터 타입 혼동 에러',
        body: '주관적인 감정(Feeling)을 객관적인 사실(Fact)로 오인하는 오류입니다.',
        items: [
          { label: '분석', text: '"내가 불안을 느끼기 때문에 이 상황은 위험하다"라는 논리는 데이터 타입이 다른 정보를 인과관계로 연결한 심각한 시스템 에러입니다.' },
        ],
        debuggingQuestion: '"내 불안이라는 감정을 배제했을 때, 외부 상황에 존재하는 객관적 위험 데이터는 무엇인가?"',
      },
      {
        id: 'dbug-03-s5',
        title: '3.5 개인화 (Personalization): 귀인 오류',
        body: '자신과 무관하거나 통제할 수 없는 외부 사건을 전적으로 자신의 책임이나 가치 문제로 돌리는 오류입니다.',
        items: [
          { label: '분석', text: '환경적 변수와 타인의 변수를 무시하고 오직 자신이라는 변수만을 입력값으로 사용하는 논리적 협소함입니다.' },
        ],
        debuggingQuestion: '"이 사건에 영향을 준 외부 변수(타인, 타이밍, 환경) 5가지를 리스트업하라."',
      },
    ],
  },
  {
    id: 'meta-04',
    navLabel: '메타인지와 CAS',
    title: '4. 메타인지와 CAS: 인지적 통제권의 확보',
    intro:
      '단순히 생각을 바꾸는 것을 넘어, 생각하는 방식(Process) 자체를 최적화해야 합니다.',
    subSections: [
      {
        id: 'meta-04-s1',
        title: '4.1 인지적 주의 증후군 (CAS: Cognitive Attentional Syndrome)',
        body: '불안과 우울은 특정한 생각의 내용보다, 그 생각을 처리하는 방식인 반추(Rumination)와 걱정(Worry)에 의해 유지됩니다.',
        items: [
          { label: '시스템 고착', text: '시스템 1이 위협 신호를 반복적으로 재생하며 시스템 2의 주의 자원을 독점하는 상태입니다.' },
          { label: 'Bluebird의 개입', text: '반추가 문제를 해결하는 데 도움이 되지 않는다는 데이터를 제시하여 주의 자원을 현재의 과업으로 강제 재배치합니다.' },
        ],
      },
      {
        id: 'meta-04-s2',
        title: '4.2 탈중심화 (Decentering): 관찰자 시점의 확립',
        body: '자신의 생각을 \'나 자신\'이 아닌, 마음이라는 공간을 지나가는 일시적인 데이터(Event)로 인식하는 기술입니다.',
        items: [
          { label: '목표', text: '"나는 실패자다"라는 생각을 "나는 내가 실패자라는 생각을 하고 있다"로 변환하는 것입니다. 이 미세한 언어적 전환이 관리자 권한을 획득하는 핵심입니다.' },
        ],
      },
    ],
  },
  {
    id: 'goal-05',
    navLabel: '실존적 자율성',
    title: '5. 최종 목표: 실존적 자율성 (Existential Agency)',
    intro:
      'Project Bluebird의 지향점은 감정이 없는 로봇이 되는 것이 아닙니다. 자신의 인지 아키텍처를 명확히 이해하고, 시스템 1의 자동적 반응에 휘둘리지 않으며, 데이터와 논리에 기반하여 자신의 삶을 직접 선택하고 집행하는 상태입니다.',
    subSections: [
      {
        id: 'goal-05-s1',
        title: '5.1 부조리와 주체성',
        body: '알베르 카뮈가 말했듯, 세상은 본질적으로 부조리하고 불확실합니다. 하지만 그 부조리함을 명확히 인식(Lucidity)하고, 그럼에도 불구하고 자신의 의지로 선택을 내리는 것만이 인간의 유일한 존엄성이자 자율성입니다.',
      },
      {
        id: 'goal-05-s2',
        title: '5.2 자율성 인프라의 구축',
        body: 'Bluebird는 당신의 사고 과정을 투명하게 시각화하여 보여줌으로써, 당신이 환경의 자극에 반응하는 객체가 아니라 환경을 분석하고 선택하는 주체가 되도록 돕습니다. 당신의 뇌는 당신의 명령을 수행하는 도구여야 합니다. 주도권을 탈환하십시오.',
      },
    ],
  },
];

// 기존 컴포넌트 호환용 (prospect value chart 섹션에서 사용)
export const PROSPECT_THEORY_CHART_NOTE =
  'Prospect Theory Value Function (S-Curve Simulation)';
