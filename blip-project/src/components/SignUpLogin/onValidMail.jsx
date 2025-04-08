const onValidMail = useCallback(
  (e) => {
    e.preventDefault();
    fetch(api.emailCheck, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify({
        userEmail: formValue.email,
      }),
    }).then((res) => {
      if (res.status === 200) {
        setIsGetCode(true);
        setIsTimer(true);
        setCount(180);
      } else if (res.status === 401) {
        alert("이미 존재하는 이메일입니다.");
      } else if (res.status === 402) {
        alert("이미 인증이 진행중입니다.");
      }
    });
  },
  [formValue]
);
