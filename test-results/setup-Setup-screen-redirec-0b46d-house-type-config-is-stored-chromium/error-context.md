# Page snapshot

```yaml
- generic [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - img [ref=e16]
      - heading "კიოსკის გააქტიურება" [level=1] [ref=e19]
      - paragraph [ref=e20]: შეიყვანეთ კიოსკის კოდები
    - generic [ref=e21]:
      - generic [ref=e22]:
        - text: მოკლე კოდი
        - textbox "მოკლე კოდი" [active] [ref=e23]:
          - /placeholder: "მაგ: TBIL1"
      - generic [ref=e24]:
        - text: წვდომის კოდი
        - textbox "წვდომის კოდი" [ref=e25]:
          - /placeholder: ••••••••
      - button "კიოსკის გააქტიურება" [disabled]
```